# Jundot/gemma-4-31B-it-oQ3e-mtp

## Resumen

gemma-4-31B-it-oQ3e-mtp es un checkpoint cuantizado en formato MLX del modelo denso google/gemma-4-31B-it, publicado por el usuario Jundot mediante la herramienta oQ (oMLX v0.7.1). Se trata de una cuantizacion de precision mixta que reduce el peso del modelo original a un promedio efectivo de 4,054 bits por parametro, ocupando 14,980 GiB en disco (16,085 GB) frente a los aproximadamente 60 GB que exigiria el checkpoint en BF16. El repositorio incluye la columna vertebral del modelo de lenguaje, el codificador de vision y una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-31B-it-assistant.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind y es un transformer denso de 30,7B parametros con entrada de texto e imagen, modos de pensamiento configurables y una ventana de contexto de 256K tokens. El checkpoint cuantizado conserva 31.743B parametros logicos en total, distribuidos entre el backbone de lenguaje (30.697B), el codificador de vision (0.576B) y la cabeza MTP (0.470B).

Su relevancia practica esta en que permite ejecutar un modelo multimodal de 30B con contexto largo en hardware de Apple Silicon con memoria unificada moderada, algo inviable con los pesos originales en BF16. La licencia Apache-2.0, heredada del modelo fuente segun la model card, facilita su integracion en entornos de desarrollo y produccion sin las restricciones adicionales que suelen acompanar a otros modelos de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo de lenguaje + codificador de vision + cabeza de prediccion multi-token) |
| Parametros totales | 31.742.607.472 (31,743B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ3e de precision mixta (3, 4, 5 y 6 bits afines con grupo 64, mas tensores en BF16); promedio efectivo de 4,054 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0, siguiendo el modelo fuente (Gemma 4 license) |
| Formato de pesos | MLX safetensors |

Desglose de la cuantizacion por formato de almacenamiento:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afin 3-bit, grupo 64 | 28,478B | 89,716% | 11,604 GiB | 3,50 |
| Afin 4-bit, grupo 64 | 0,011B | 0,035% | 0,006 GiB | 4,50 |
| Afin 5-bit, grupo 64 | 2,075B | 6,538% | 1,329 GiB | 5,50 |
| Afin 6-bit, grupo 64 | 0,138B | 0,434% | 0,104 GiB | 6,50 |
| BF16 | 1,040B | 3,278% | 1,938 GiB | 16,00 |
| Total | 31,743B | 100% | 14,980 GiB | 4,054 |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 30,697B | 14,004 GB / 13,042 GiB |
| Codificador de vision | 0,576B | 1,142 GB / 1,063 GiB |
| Cabeza MTP | 0,470B | 0,939 GB / 0,875 GiB |
| Total | 31,743B | 16,085 GB / 14,980 GiB |

## Arquitectura y entrenamiento

El modelo fuente es un transformer denso de la familia Gemma 4, con una columna vertebral de lenguaje de 30,697B parametros, un codificador de vision de 0,576B y una cabeza de prediccion multi-token de 0,470B. La model card indica que el checkpoint soporta entrada de texto e imagen y modos de pensamiento configurables, con una ventana de contexto de 256K tokens. La cabeza MTP fue fusionada desde google/gemma-4-31B-it-assistant, lo que anade la capacidad de predecir varios tokens por paso; esta tecnica se emplea habitualmente para habilitar decodificacion especulativa y aumentar el throughput de generacion.

En cuanto al proceso de cuantizacion, oQ3e asigna bits en funcion de la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y aplica un reajuste de escala y sesgo por minimos cuadrados ponderados. El resultado es una distribucion muy asimetrica: el 89,716% de los pesos logicos quedan en 3 bits y solo el 3,278% permanecen en BF16, presumiblemente en las capas mas sensibles. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original, ya que la model card del checkpoint cuantizado no los detalla.

## Capacidades

- Generacion de texto conversacional en modo chat (etiqueta `conversational`).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con un codificador de vision dedicado de 0,576B parametros.
- Modos de pensamiento configurables, segun la model card del checkpoint.
- Prediccion multi-token mediante la cabeza MTP fusionada, orientada a acelerar la decodificacion.
- Contexto de 256K tokens, adecuado para documentos largos y conversaciones multi-turno extensas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.
- Otras capacidades especiales (audio, vision adicional): no disponible.

## Casos de uso

- Analisis de documentos largos con imagenes: gracias a la ventana de 256K tokens y al codificador de vision, el modelo puede procesar informes extensos con graficos, tablas escaneadas o capturas y responder preguntas sobre su contenido en una sola pasada.
- Asistentes conversacionales con memoria extensa: la ventana de contexto permite mantener historiales de conversacion muy largos sin truncado agresivo, util en soporte tecnico especializado donde el hilo acumula semanas de interacciones.
- Inferencia local en portatiles Apple Silicon: con 14,980 GiB de pesos, el checkpoint es viable en equipos con 24-32 GB de memoria unificada, lo que permite ejecutar un modelo multimodal de 30B sin conexion y sin enviar datos a servicios externos.
- Prototipado rapido en investigacion: al ser un checkpoint MLX con licencia Apache-2.0, se puede integrar en cuadernos y scripts sobre el framework MLX para experimentar con prompting multimodal o evaluar el impacto de la cuantizacion de 4 bits frente al modelo original.
- Extraccion de informacion estructurada a partir de capturas o formularios: el modelo puede leer documentos visuales y devolver campos normalizados en texto, un patron habitual en pipelines de digitalizacion de documentos.
- Generacion de resumenes de material mixto: combinando texto e imagenes de un mismo corpus (por ejemplo, articulos con figuras), el modelo puede producir resumenes que referencien ambos tipos de contenido.
- Evaluacion comparativa de tecnicas de cuantizacion: al conservar la cabeza MTP y un desglose explicito de bits por capa, sirve como referencia para medir la perdida de calidad de la cuantizacion de 4 bits frente a BF16.
- Aceleracion de decodificacion en tareas de generacion larga: la cabeza MTP integrada puede aprovecharse para decodificacion especulativa en escenarios donde el throughput sea critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas frente al modelo base en BF16.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: los pesos del checkpoint ocupan 14,980 GiB. Sumando la cache KV para contextos largos, se estima un minimo practico de 18-20 GB de memoria unificada para contextos cortos y 32 GB o mas para aprovechar la ventana de 256K tokens. Estas cifras son una estimacion derivada del tamano del repositorio, no un dato publicado.
- GPU recomendadas: el formato es MLX, por lo que la ejecucion esta limitada a Apple Silicon (familias M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No es directamente ejecutable en GPU NVIDIA o AMD sin conversion previa a otro formato.
- Viabilidad en hardware de consumo: si, en equipos Apple con 24 GB o mas de memoria unificada; en configuraciones de 16 GB el margen es muy ajustado o insuficiente.
- Opciones de despliegue: MLX y sus utilidades asociadas (mlx-lm, mlx-vlm). Otros motores como vLLM, TGI, llama.cpp u Ollama requeririan convertir los pesos a GGUF u otro formato, algo que no esta cubierto por este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ3e-mtp | 31,743B | 256K | MLX safetensors, ~15 GiB | Apache-2.0 | HuggingFace |
| google/gemma-4-31B-it | 30,7B (backbone de lenguaje) | 256K | Safetensors BF16 (sin confirmar) | Gemma 4 license | HuggingFace |
| google/gemma-4-31B-it-assistant | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se dispone en la informacion proporcionada de otros checkpoints cuantizados comparables del mismo modelo base, ni de datos de rendimiento que permitan contrastar la perdida de calidad de esta cuantizacion frente a alternativas.

## Limitaciones y advertencias

- La cuantizacion a un promedio de 4,054 bits/peso puede degradar la calidad respecto al modelo original en BF16, especialmente en tareas de razonamiento matematico, codigo o instrucciones de formato estricto. La model card no publica evaluaciones que cuantifiquen esa perdida.
- No se dispone de informacion sobre sesgos del modelo base ni del proceso de cuantizacion, por lo que no se puede caracterizar el riesgo de sesgo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; la cuantizacion agresiva puede incrementarlo al reducir la precision numerica de los pesos.
- Idiomas soportados: la model card no los enumera. No se puede confirmar el grado de cobertura en castellano ni en otras lenguas.
- Limitaciones de contexto: aunque se anuncian 256K tokens, no se publican pruebas de recuperacion efectiva de informacion en ventanas tan largas, y la cache KV a esa longitud exige mucha memoria.
- La licencia declarada es Apache-2.0, pero enlaza a la Gemma 4 license de Google. Conviene revisar los terminos especificos de esa licencia antes de un uso comercial, ya que las condiciones de la familia Gemma pueden incluir restricciones de uso aceptable adicionales.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay pesos GGUF ni safetensors genericos en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue actualizado un minuto despues de su creacion, lo que sugiere que no ha pasado por validacion de la comunidad.
- Dependencia de la herramienta oQ (oMLX v0.7.1) y de la variante Improved oQe Quantization para reproducir el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-31B-it-oQ3e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
