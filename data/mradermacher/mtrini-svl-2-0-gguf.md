# mradermacher/Mtrini-SVL-2.0-GGUF

## Resumen

Mtrini-SVL-2.0-GGUF es la distribucion en formato GGUF del modelo Mtrini-SVL-2.0, desarrollado originalmente por CompiwerAI y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B) orientado a tareas de razonamiento, generacion de codigo y conversacion multilingue, con especial enfasis en el dialecto marroqui (dariya, codigo ISO `ary`), arabe estandar y ingles. La version aqui descrita es una conversión a GGUF pensada para inferencia local con llama.cpp y herramientas compatibles.

El modelo parte de una base etiquetada como `qwen3_5` y ha sido afinado sobre una mezcla de datasets de razonamiento de alta calidad (s1K-1.1, LIMO, OpenThoughts3-1.2M, cadenas de codigo de Codeforces) y un conjunto de datos de SFT en dariya (Darija-SFT-Mixture de MBZUAI-Paris). Es relevante porque cubre un nicho poco atendido: razonamiento tecnico con soporte nativo de un dialecto arabe de bajos recursos, empaquetado en cuantizaciones que caben en hardware de consumo.

La licencia Apache 2.0 facilita su uso comercial, y el repositorio incluye cuantizaciones desde Q2_K (3,9 GB) hasta f16 (18 GB), ademas de un complemento multimodal (mmproj) que sugiere capacidades de vision, aunque la informacion disponible no detalla su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base etiquetada como qwen3_5; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | arabe estandar (`ar`), dariya marroqui (`ary`), ingles (`en`); el campo `language` del repo solo lista `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo original en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5`, que sugiere una base derivada de la familia Qwen 3.5. No se especifican el numero de capas, la dimension oculta, el tipo de atencion ni si incorpora innovaciones como decodificacion especulativa o atencion lineal. El dato firme es el recuento de parametros: 8.953.803.264, lo que situa al modelo en la franja de 8-9 B, adecuada para inferencia en GPU de consumo con cuantizaciones de 4 bits.

El entrenamiento combina datasets de razonamiento y SFT: `simplescaling/s1K-1.1` (destilacion de cadenas de razonamiento), `GAIR/LIMO` (razonamiento matematico con pocas muestras), `open-r1/codeforces-cots` (cadenas de pensamiento para problemas competitivos de programacion), `open-thoughts/OpenThoughts3-1.2M` (1,2 M de muestras de razonamiento) y `MBZUAI-Paris/Darija-SFT-Mixture` (ajuste supervisado en dariya). No se indica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La presencia de `mmproj` en el repo sugiere un componente multimodal, pero su naturaleza exacta no esta documentada en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito (cadenas de pensamiento), entrenado sobre s1K-1.1, LIMO y OpenThoughts3.
- Razonamiento matematico y resolucion de problemas, con enfasis en datos tipo LIMO.
- Generacion de codigo y razonamiento sobre problemas de programacion competitiva (Codeforces-CoTs).
- Soporte nativo de dariya marroqui y arabe estandar, ademas de ingles.
- Posible capacidad multimodal (vision) por la presencia de ficheros `mmproj`, aunque el alcance no esta documentado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita el despliegue como API.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el entrenamiento en CoT lo hace plausible.

## Casos de uso

- Atencion al cliente en dariya y arabe: el modelo puede gestionar conversaciones multi-turno en dialecto marroqui, un idioma con poca cobertura en modelos abiertos, lo que lo hace adecuado para empresas que operan en Marruecos.
- Generacion de codigo asistida en local: con cuantizacion Q4_K_M (5,7 GB) se puede ejecutar en una GPU de consumo y usarse como asistente de programacion en entornos sin conexion.
- Tutoria de matematicas y razonamiento paso a paso: el entrenamiento sobre LIMO y s1K-1.1 permite generar explicaciones detalladas de problemas, util en plataformas educativas.
- Procesamiento de problemas de programacion competitiva: el ajuste con Codeforces-CoTs lo hace apropiado para generar soluciones razonadas a enunciados de algoritmia.
- Traduccion y adaptacion cultural entre dariya, arabe estandar e ingles: util para localizacion de contenidos y moderacion de comunidades.
- Despliegue en edge o portatiles: la version Q2_K (3,9 GB) permite ejecucion en CPU o GPUs con poca VRAM mediante llama.cpp u Ollama, para prototipos y demos.
- Investigacion en dialectologia arabe: sirve como base para experimentos de NLP en variedades de bajo recursos, dado su ajuste especifico en dariya.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (3,9 GB): ~5-6 GB de VRAM.
  - Q4_K_M (5,7 GB): ~7-8 GB de VRAM.
  - Q8_0 (9,6 GB): ~11-12 GB de VRAM.
  - f16 (18 GB): ~20-22 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q8_0; RTX 4090 (24 GB) para f16; A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, con cuantizaciones de 2 a 5 bits en GPUs de 8-12 GB; la version f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo original (safetensors) puede servirse con vLLM o TGI, aunque no se confirma compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mtrini-SVL-2.0 | ~8,95 B | no disponible | Apache 2.0 | GGUF y safetensors | Razonamiento + dariya |
| Qwen2.5-7B | 7,6 B | 128 K | Apache 2.0 | GGUF, safetensors | Base generalista multilingue |
| Llama 3.1 8B | 8,0 B | 128 K | Llama 3.1 Community | GGUF, safetensors | Multilingue, uso comercial con restricciones |
| Gemma 2 9B | 9,2 B | 8 K | Gemma Terms | GGUF, safetensors | Buen rendimiento en razonamiento |

La comparacion con Qwen2.5-7B y Llama 3.1 8B es orientativa: son modelos de tamano similar con los que compite en despliegue local, pero no se dispone de benchmarks del Mtrini-SVL-2.0 para contrastar rendimiento. Su diferenciador principal es el ajuste en dariya y en razonamiento con CoT.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes ni benchmarks, por lo que el rendimiento real es incierto.
- Riesgo de alucinacion inherente a los modelos de 8-9 B, especialmente en tareas de conocimiento factual.
- La cobertura linguistica declarada es limitada (ar, ary, en); el campo `language` del repo solo lista `en`, lo que puede indicar inconsistencias en la documentacion.
- El contexto maximo no esta documentado; no se debe asumir una ventana larga sin verificacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (algunos de razonamiento pueden tener restricciones derivadas).
- La capacidad multimodal es incierta: existen ficheros `mmproj`, pero no hay documentacion sobre el modelo de vision ni su calidad.
- El modelo es una cuantizacion de terceros (mradermacher); para produccion conviene validar la fidelidad frente al original en safetensors.
- No se documentan sesgos especificos, pero el ajuste en dariya puede introducir sesgos regionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mtrini-SVL-2.0-GGUF
- Modelo base: https://huggingface.co/CompiwerAI/Mtrini-SVL-2.0
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Mtrini-SVL-2.0-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Mtrini-SVL-2.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset s1K-1.1: https://huggingface.co/datasets/simplescaling/s1K-1.1
- Dataset LIMO: https://huggingface.co/datasets/GAIR/LIMO
- Dataset Codeforces-CoTs: https://huggingface.co/datasets/open-r1/codeforces-cots
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset Darija-SFT-Mixture: https://huggingface.co/datasets/MBZUAI-Paris/Darija-SFT-Mixture
