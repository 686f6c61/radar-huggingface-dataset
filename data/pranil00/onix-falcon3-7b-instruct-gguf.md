# pranil00/ONIX-Falcon3-7B-Instruct-GGUF

## Resumen

ONIX-Falcon3-7B-Instruct-GGUF es una cuantización en formato GGUF del modelo tiiuae/Falcon3-7B-Instruct, publicada por el usuario pranil00 bajo el sello de la comunidad ONIX. El artefacto emplea el esquema de cuantización Q5_K_M (5,5 bits por peso) y está pensado para ejecución local en hardware de consumo mediante el motor run-any-model, aunque también es compatible con llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI. El modelo base pertenece a la familia Falcon 3 de TII (Technology Innovation Institute) y cuenta con 7.455.547.392 parámetros (7,46 mil millones).

El problema que resuelve esta publicación es la reducción de requisitos de memoria para desplegar Falcon3-7B-Instruct en equipos sin GPU de datacenter: el peso comprimido ocupa 5,01 GB (frente a 14,58 GB en FP16), lo que supone una ratio de compresión de 2,91x y una reducción del 65,6 % del espacio. El autor declara una retención de calidad del 97,5 % respecto al modelo sin cuantizar, aunque no se aportan mediciones de benchmarks que respalden esa cifra.

La relevancia actual es limitada pero práctica: se trata de un artefacto de cuantización, no de un modelo nuevo, con cero descargas y cero likes en el momento de la consulta. Su interés reside en la accesibilidad para inferencia local y en la documentación de perfiles de memoria por plataforma (Apple Silicon, NVIDIA y CPU), no en mejoras de capacidad respecto al modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (familia Falcon 3) |
| Parametros totales | 7.455.547.392 (7,46 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA; 4.096 tokens en CPU (según model card) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el repositorio solo publica este esquema |
| Idiomas soportados | no disponible (la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `tiiuae--Falcon3-7B-Instruct-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base Falcon3-7B-Instruct es un transformer decoder-only de la familia Falcon 3, que el autor de la cuantización etiqueta explícitamente como "Architecture Family: LLaMA". Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o ajuste supervisado en el modelo original; esos datos no aparecen en la información proporcionada y deben consultarse en la model card de tiiuae/Falcon3-7B-Instruct.

La innovación técnica de esta publicación no está en la arquitectura, sino en el proceso de cuantización: se aplica Q5_K_M con cuantización de bloques K-quant, se mantiene el búfer de KV cache en FP16 (448 MB) y se aceleran las 28 capas del modelo en Metal en el perfil Apple Silicon. El motor run-any-model realiza un perfilado adaptativo por dispositivo que selecciona el nivel de aceleración y la ventana de contexto en función de la memoria disponible. No se documentan técnicas como decodificación especulativa, atención lineal ni variantes híbridas SSM.

## Capacidades

- Generación de texto conversacional en modo instruct, con plantilla de chat basada en los tokens de parada `<|im_end|>` y `<|endoftext|>`.
- Razonamiento y respuesta a instrucciones heredados del modelo base Falcon3-7B-Instruct.
- Generación de código y matemáticas: capacidad atribuible al modelo base, no verificada con benchmarks en esta publicación.
- Soporte multilingüe: no disponible en la información proporcionada; la model card no enumera idiomas.
- Tool calling y function calling: no documentado en esta publicación; debe verificarse en la model card del modelo base.
- Modo agente y razonamiento multi-paso: no documentado en esta publicación.
- Ejecución local con aceleración Metal (Apple Silicon), CUDA (NVIDIA RTX 30/40/50) y CPU con instrucciones AVX2/AVX-512.
- Compatibilidad con interfaces conversacionales (`-cnv` en llama.cpp, Modelfile de Ollama, LM Studio, Jan, Text-Generation-WebUI).

## Casos de uso

- Asistente conversacional local en portátiles Apple Silicon: con 5,51 GB de memoria unificada y aceleración Metal nativa, el modelo puede mantener sesiones multi-turno de hasta 8.192 tokens sin conexión a la nube, útil para entornos con requisitos de privacidad.
- Despliegue en estaciones de trabajo con GPU de consumo: en una RTX 3060 de 12 GB o superior, el perfil de 6,51 GB de VRAM permite ejecutar el modelo con contexto de 8.192 tokens y aceleración CUDA completa, adecuado para prototipado de aplicaciones de chat.
- Generación de texto en servidores sin GPU: el perfil de CPU con 7,51 GB de RAM libre y contexto de 4.096 tokens permite usar el modelo en tareas de resumen y redacción por lotes donde la latencia no es crítica.
- Integración en flujos de trabajo de LM Studio o Jan: al ser un GGUF estándar, se puede arrastrar el archivo al directorio `models/` y usar el modelo desde interfaces gráficas sin escribir código, lo que facilita la evaluación por parte de perfiles no técnicos.
- Sustitución de APIs de pago en entornos de desarrollo: para pruebas de integración de aplicaciones que consumen un endpoint de chat, el modelo local evita costes por token y permite iterar sin límites de cuota, a costa de menor calidad que modelos frontera.
- Educación e investigación sobre cuantización: el artefacto incluye un informe de telemetría comparativo FP16 frente a Q5_K_M (tamaño, KV cache, capas aceleradas) que sirve como caso de estudio reproducible de los compromisos memoria-calidad en cuantización K-quant.
- Experimentación con el motor run-any-model: el repositorio está pensado como banco de pruebas del motor de optimización adaptativa por dispositivo, útil para quienes evalúan herramientas de despliegue alternativas a llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de compresión y memoria, no de calidad de tarea:

| Metrica | FP16 (base) | Q5_K_M (cuantizado) | Variacion |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 14,58 GB | 5,01 GB | -65,6 % |
| KV cache | 448 MB (FP16) | 448 MB (FP16) | Optimizado |
| RAM residente total | 15,08 GB | 5,51 GB | -63,5 % |
| Calidad estimada | 100 % (referencia) | 97,5 % retenida | -2,5 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 28/28 | Optimo |

La cifra de "97,5 % de retención de calidad" es una estimación del autor sin metodología publicada; no debe interpretarse como resultado de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada.

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 5,51 GB de memoria unificada, contexto óptimo de 8.192 tokens, aceleración Metal nativa al 100 %.
- NVIDIA RTX 30/40/50: 6,51 GB de VRAM dedicada, contexto de 8.192 tokens, aceleración CUDA completa.
- PC Windows/Linux con CPU: 7,51 GB de RAM libre, contexto de 4.096 tokens, soporte AVX2/AVX-512.
- Cabe en GPU de consumo: sí, con 8 GB de VRAM o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores); en GPUs de 6 GB el margen es insuficiente para el perfil documentado.
- Opciones de despliegue: run-any-model (CLI), llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Falcon3-7B-Instruct-GGUF (esta ficha) | 7,46 B | 8.192 (GPU) / 4.096 (CPU) | GGUF Q5_K_M | Apache 2.0 | Cuantización comunitaria, 0 descargas, sin benchmarks publicados |
| tiiuae/Falcon3-7B-Instruct (original) | 7,46 B | no disponible en esta ficha | safetensors (FP16/BF16) | Apache 2.0 | Modelo base oficial; requiere ~15 GB de memoria en FP16 |
| Alternativas de 7-8 B cuantizadas en GGUF (p. ej. familias Llama 3.1 8B Instruct o Qwen2.5 7B Instruct) | 7-8 B | 32.768 a 131.072 tokens según modelo | GGUF | Licencias variables (Llama Community, Apache 2.0) | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible: ni esta publicación ni la información suministrada incluyen resultados de benchmarks que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para esta cuantización; los riesgos del modelo base se heredan sin mitigación documentada.
- La retención de calidad del 97,5 % es una estimación del autor sin metodología ni conjunto de evaluación publicados; la degradación real en tareas de razonamiento o código puede ser mayor.
- El contexto práctico está limitado a 8.192 tokens en GPU y Apple Silicon, y a 4.096 tokens en CPU; no se documenta soporte para ventanas mayores.
- Los idiomas soportados no están especificados en la model card; no se debe asumir un rendimiento multilingüe sin verificación empírica.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (25 de noviembre de 2026): no hay evidencia de uso comunitario ni de validación independiente del artefacto.
- Aunque la licencia declarada es Apache 2.0, conviene verificar que la conversión respeta los términos del modelo base y citar adecuadamente a TII como autor original.
- El artefacto se distribuye "AS IS", con un descargo de responsabilidad absoluto por parte del autor: la validación de las salidas en producción recae íntegramente en el implementador.
- La dependencia del motor run-any-model para el flujo de ejecución recomendado introduce un componente de terceros con mantenimiento incierto; para producción es preferible usar llama.cpp u Ollama directamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Falcon3-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Motor run-any-model (GitHub): https://github.com/PranilShah-08/run-any-model
