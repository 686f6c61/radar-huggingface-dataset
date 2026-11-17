# qhddz/paraformer-rknn3-rk1828

## Resumen

`qhddz/paraformer-rknn3-rk1828` es un artefacto de modelo publicado en Hugging Face por el usuario `qhddz` bajo licencia Apache 2.0. Por la nomenclatura del identificador, se trata de una conversión del modelo de reconocimiento automático de voz (ASR) Paraformer al formato RKNN, orientada a su ejecución sobre NPU de Rockchip. El sufijo `rknn3-rk1828` apunta a la versión del toolkit RKNN (v3) y a la plataforma objetivo RK1828, un SoC de la familia Rockchip con acelerador neuronal integrado.

Paraformer es una arquitectura de ASR no autorregresiva basada en transformer, propuesta originalmente por el grupo de investigación de Alibaba (FunASR), que predice la secuencia completa de tokens en paralelo en lugar de decodificar token a token. Su principal ventaja es la baja latencia en inferencia, lo que la hace atractiva para despliegue en dispositivos de borde. Esta ficha describe el artefacto publicado, no el modelo original de FunASR.

La información disponible en la model card es prácticamente inexistente: solo consta la licencia Apache 2.0. No se publican especificaciones de arquitectura, parámetros, contexto, idiomas, formatos de cuantización ni resultados de benchmarks. Cualquier dato técnico que no aparezca explícitamente en esta ficha debe considerarse no disponible y requeriría inspección directa de los archivos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por nomenclatura, conversión de Paraformer a RKNN para NPU Rockchip) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el formato RKNN suele implicar cuantización int8, pero no se confirma en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente artefacto RKNN compilado; no se detalla en la model card) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste de este artefacto concreto. El identificador sugiere que se parte de un modelo Paraformer (transformer no autorregresivo para ASR) y se compila a un binario RKNN ejecutable en la NPU del SoC Rockchip RK1828 mediante RKNN-Toolkit2 versión 3. No se documenta el conjunto de datos de entrenamiento original, el número de tokens, ni si hubo ajuste fino posterior a la conversión.

Tampoco se especifica si la conversión incluye cuantización post-entrenamiento (PTQ) o quantización consciente del entrenamiento (QAT), ni el esquema de calibración empleado. La ausencia de esta información impide evaluar la degradación de precisión respecto al modelo flotante original.

## Capacidades

- Reconocimiento automático de voz (ASR): por herencia del modelo base Paraformer, se espera transcripción de audio a texto, aunque no se documenta en la model card.
- Inferencia en dispositivo de borde: el formato RKNN está pensado para ejecución acelerada en NPU Rockchip, lo que implica despliegue local sin GPU dedicada.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se documenta modo thinking, soporte de audio más allá del propio ASR, ni funciones multimodales.

## Casos de uso

- Transcripción de voz en dispositivos embebidos: el artefacto RKNN permitiría ejecutar ASR local en hardware Rockchip RK1828 sin conexión a la nube, útil en dispositivos IoT con micrófono.
- Subtitulado en tiempo real en equipos de borde: la naturaleza no autorregresiva de Paraformer reduce la latencia, lo que encaja en aplicaciones de transcripción en vivo sobre NPU.
- Procesamiento de audio en kioscos o terminales de atención al público: despliegue local que evita enviar audio a servidores externos por motivos de privacidad.
- Integración en cámaras o dispositivos de vigilancia con reconocimiento de comandos de voz: ejecución sobre NPU de bajo consumo.
- Automatización industrial con interfaces por voz: transcripción de instrucciones en entornos donde no se permite conectividad cloud.
- Prototipado de pipelines ASR en placas Rockchip: validación de la cadena de conversión RKNN antes de pasar a producción.

Nota: todos estos casos son hipótesis derivadas del formato y la nomenclatura del artefacto, no de documentación del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: NPU del SoC Rockchip RK1828, según el identificador del modelo.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no aplica; el artefacto está orientado a NPU Rockchip, no a GPU convencional.
- Compatibilidad con GPU de consumo: no disponible; el formato RKNN no se ejecuta en CUDA.
- Opciones de despliegue: RKNN-Toolkit2 / RKNPU2 runtime sobre el SoC Rockchip correspondiente; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qhddz/paraformer-rknn3-rk1828 | no disponible | no disponible | RKNN (presunto) | Apache 2.0 | Hugging Face |
| Paraformer original (FunASR) | no disponible en esta ficha | no disponible | PyTorch / ONNX | no disponible en esta ficha | Repositorio FunASR |
| Whisper (OpenAI) | variable según variante | 30 s por ventana | PyTorch / GGML | MIT | Hugging Face / OpenAI |
| Wav2Vec2 (Meta) | variable según variante | no disponible | PyTorch | MIT / Apache 2.0 según variante | Hugging Face |

La comparación es orientativa: no se dispone de datos de rendimiento del artefacto RKNN ni de su modelo base, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no contiene documentación técnica: no hay información sobre arquitectura, datos de entrenamiento, idiomas ni métricas.
- El formato RKNN está ligado a una plataforma hardware concreta (Rockchip RK1828); no es portable a GPU o CPU convencionales sin reconversión.
- Se desconoce si la cuantización introduce degradación de precisión en la transcripción.
- No se especifican los idiomas soportados ni el dominio de audio para el que fue entrenado el modelo base.
- Riesgo de alucinación y errores de transcripción: no evaluado por falta de benchmarks.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el modelo base y sus datos de entrenamiento impide verificar el cumplimiento de posibles restricciones heredadas.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-17), lo que puede indicar un artefacto de prueba o un error de publicación.

## Enlaces

- Hugging Face: https://huggingface.co/qhddz/paraformer-rknn3-rk1828
- Repositorio FunASR (modelo base Paraformer): https://github.com/modelscope/FunASR
- RKNN-Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
- Paper Paraformer: no disponible en la información proporcionada.
