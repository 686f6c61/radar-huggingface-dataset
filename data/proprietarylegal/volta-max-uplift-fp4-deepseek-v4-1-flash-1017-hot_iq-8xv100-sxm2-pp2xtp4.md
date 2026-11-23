# ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-hot_iq-8xV100-SXM2-PP2xTP4

## Resumen

Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017 es un paquete de cuantización mixta publicado por el usuario ProprietaryLegal sobre el modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un transformer de tipo mixture-of-experts (MoE) de DeepSeek. El paquete no es un modelo nuevo: redistribuye los pesos del base en precisión mixta FP4 (NVFP4 y MXFP4) junto con mapas de tiers, plantillas de servicio y un motor de inferencia alojado en GitHub, todo orientado a ejecutar el modelo en ocho NVIDIA V100-SXM2 (arquitectura Volta, SM70) con paralelismo PP2 x TP4.

El objetivo declarado es colocar en las tarjetas, durante la decodificación, el máximo posible del trabajo enrutado a expertos a precisión NVFP4 nativa, manteniendo todos los expertos enrutados residentes en las GPU. En la configuración por defecto de dos slots, 5.936 de los 15.360 expertos enrutados quedan a NVFP4 exacto, y el autor estima que entre el 78 % y el 85 % de las rutas de decodificación se ejecutan a esa precisión. El paquete incluye además decodificación especulativa y un motor de servicio con caché de prefijos.

El modelo tiene 196.613.849.600 parámetros totales según los safetensors del repo (556,2 GB en total), licencia MIT y pipeline de text-generation. Es relevante para quienes necesitan desplegar un MoE grande en hardware Volta sin acceso a FP8/FP4 nativo de generaciones posteriores, a costa de un proceso de servicio específico y de una calidad que el propio autor no ha validado por completo en todas las configuraciones de slots.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), modelo base DeepSeek-V4.1-Flash-1017 |
| Parametros totales | 196.613.849.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el bench menciona prompts de hasta 256K tokens) |
| Tipos de cuantizacion | FP4 mixta: NVFP4 y MXFP4; pesos en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El paquete parte de un transformer MoE (etiquetado `deepseek_v41` y `moe` en los tags) con 15.360 expertos enrutados según los recuentos del autor. La contribución del paquete no es el entrenamiento sino la cuantización: distribuye los expertos enrutados entre precisión NVFP4 exacta y otras precisiones según mapas de tiers (`tier_maps/slots2.json`, con variantes de uno y tres slots), de modo que una parte del trabajo enrutado se ejecuta a FP4 nativo y el resto a mayor precisión, todo cabiendo en ocho V100 de 32 GB con paralelismo pipeline 2 x tensor 4. El motor asociado (repositorio GitHub del autor) incorpora decodificación especulativa, lectura de prompts con dos kernels bit-idénticos (un SwiGLU de un solo lanzamiento y el kernel RB de 4 expertos), reutilización de caché cuando un mensaje de sistema se inserta a mitad de chat y switches de ruta de petición.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el paquete es una cuantización del base y no documenta el entrenamiento original. Las innovaciones técnicas destacadas son la cuantización mixta FP4 sobre Volta (que carece de soporte nativo de FP4, de ahí el nombre "uPLIft"), la decodificación especulativa y el servicio multi-slot con lectura rápida de prompts.

## Capacidades

- Generación de texto con el modelo base DeepSeek-V4.1-Flash-1017 (pipeline text-generation).
- Razonamiento y generación de código: el autor reporta decodificación de código a 143-175 tok/s desde prompts de 1K a 256K tokens.
- Estilo legal: el autor mide un conjunto "legal-style" a 94,7-97,3 tok/s.
- Servicio multi-petición: opciones de uno, dos y tres slots, con hasta 192,3 tok/s agregados en tres peticiones simultáneas (1,62x un stream).
- Decodificación especulativa integrada en el motor de servicio.
- Caché de prefijos y reutilización de contexto en conversaciones multi-turno (un chat de 30.779 tokens reutilizó 30.752 tokens en 0,45 s frente a 14,84 s).
- Tool calling, function calling, agentes y capacidades multimodales: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue de un MoE grande en infraestructura Volta existente: el paquete permite servir DeepSeek-V4.1-Flash en ocho V100-SXM2 sin migrar a GPU con soporte FP4 nativo, usando PP2 x TP4 y los mapas de tiers incluidos.
- Generación de código en producción: el autor mide 143-175 tok/s de decodificación en prompts de hasta 256K tokens, adecuado para autocompletado y generación de parches en pipelines de CI/CD.
- Asistencia legal documental: el conjunto "legal-style" se decodifica a 94,7-97,3 tok/s, útil para redacción y revisión de contratos con contexto largo.
- Chat multi-turno con contexto extenso: la reutilización de caché (0,45 s frente a 14,84 s en un chat de 30.779 tokens) reduce la latencia en conversaciones largas con mensajes de sistema insertados.
- Servicio concurrente de varias peticiones: la opción de tres slots entrega 192,3 tok/s agregados con los mismos token ids que en ejecución individual, apto para APIs internas con carga moderada.
- Evaluación de cuantización FP4 en hardware sin FP4 nativo: el paquete sirve como referencia reproducible (mapas de tiers, plantillas de servicio, SHA256SUMS) para estudiar el impacto de la cuantización mixta en la calidad de salida.
- Investigación sobre decodificación especulativa y kernels bit-idénticos: el motor y los datos de bench permiten comparar variantes de lectura de prompts y caché.

## Benchmarks y rendimiento

Datos medidos por el autor (no verificados de forma independiente). Las cifras de velocidad corresponden a ejecuciones con tarjetas a 300 W y 1.530 MHz máximos, una petición a la vez salvo donde se indique.

| Metrica | Resultado | Configuracion |
|---|---|---|
| Mismos token ids que el pack NVFP4 de NVIDIA | 95,1 % | Dos slots (Volta sPLIt: 92,2 %) |
| Rutas de decodificación a precisión NVFP4 | 78-85 % (predicho, dos slots); 80-86 % medido en un slot | Dos slots |
| Expertos enrutados a NVFP4 | 5.936 de 15.360 | Dos slots (por defecto) |
| Velocidad, conjunto general corto | 123,2 tok/s | Dos slots, una petición |
| Velocidad, conjunto legal-style | 97,3 tok/s | Dos slots, una petición |
| Velocidad, código | 150-180 tok/s (1K-256K prompts) | Dos slots, una petición |
| Tres peticiones simultáneas | 192,3 tok/s (1,62x un stream) | Tres slots |
| Dos peticiones simultáneas | 159,0 tok/s (1,34x) | Dos slots |
| Primer token tras prompt de 256K | 207,9 s | Build de kernel 2026-11-11, un slot |
| Primer token con caché reutilizada | 0,69 s frente a 31,0 s a 100K tokens | Motor 2026-11-13 |
| Pico de memoria en stage 1 | 31.956 MiB (límite 31.998 MiB) | Boot de bench close-out |

No se han publicado resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM: ocho NVIDIA V100-SXM2 de 32 GB (256 GB en total), con paralelismo PP2 x TP4. El pico de memoria de stage 1 medido es de 31.956 MiB frente a un límite de 31.998 MiB.
- GPU recomendadas: V100-SXM2 (SM70) es el objetivo explícito; no se documenta soporte para A100, H100 ni RTX 4090.
- Consumer GPU: no cabe en GPU de consumo; el paquete requiere el conjunto de ocho V100.
- Despliegue: motor propio del repositorio GitHub del autor, con vLLM citado en los tags; plantillas de servicio en `serve/` y mapas de tiers en `tier_maps/`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 97,3-123,2 tok/s en una petición (dos slots), 192,3 tok/s con tres peticiones (tres slots); primer token de 0,69 s con caché frente a 31,0 s sin ella a 100K tokens.
- Repo: 556,2 GB de tamaño total; descarga única según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Volta-Max-uPLIft-FP4 (este paquete) | 196.613.849.600 | no disponible | FP4 mixta (NVFP4/MXFP4) | MIT | 8x V100-SXM2, PP2 x TP4 |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Pack NVFP4 de NVIDIA (referencia del autor) | no disponible | no disponible | NVFP4 | no disponible | no disponible |
| Volta sPLIt (variante previa del autor) | no disponible | no disponible | FP4 mixta | no disponible | 8x V100-SXM2 |

La comparativa se limita a las referencias citadas en la model card; no se dispone de datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- La calidad no está establecida para las opciones multi-slot ni para la lectura rápida de prompts; el propio autor lo indica explícitamente.
- La cifra de rutas a NVFP4 con dos slots es una predicción (78-85 %), no una medición; la medición de 80-86 % corresponde a un solo slot.
- El 95,1 % de coincidencia de token ids con el pack NVFP4 implica que aproximadamente 1 de cada 20 tokens difiere del resultado de referencia.
- En el boot de bench del build final, las tarjetas de stage 1 superaron en 2 MiB la línea de memoria del build, sin fallo de memoria; el margen es muy estrecho.
- El motor de servicio es específico del repositorio del autor y evoluciona con commits frecuentes; las plantillas y mapas de tiers de una versión pueden ser rechazados por otra (el `tier_map.json` del primer release ya no lo acepta el motor posterior).
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específicos del modelo base en la documentación proporcionada.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero debe verificarse la licencia del modelo base DeepSeek-V4.1-Flash-1017 antes de producción.
- El despliegue exige hardware Volta de ocho GPU; no es viable en entornos con GPU de consumo ni en clústeres sin V100.

## Enlaces

- Hugging Face: https://huggingface.co/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-hot_iq-8xV100-SXM2-PP2xTP4
- Historial de commits: https://huggingface.co/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-hot_iq-8xV100-SXM2-PP2xTP4/commits/main
- Repositorio del motor: https://github.com/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-NVFP4-8xV100-SXM2-PP2xTP4
- Bench de velocidad close-out: https://github.com/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-NVFP4-8xV100-SXM2-PP2xTP4#speed-bench-2026-11-13-close-out
- Bench de velocidad build final: https://github.com/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-NVFP4-8xV100-SXM2-PP2xTP4#speed-bench-2026-11-12-final-build
- Servicio multi-petición: https://github.com/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-NVFP4-8xV100-SXM2-PP2xTP4#serving-several-requests-at-once-window-18
- Límites: https://github.com/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-NVFP4-8xV100-SXM2-PP2xTP4#limits
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
