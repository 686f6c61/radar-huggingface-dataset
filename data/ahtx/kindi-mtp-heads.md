# ahtx/kindi-mtp-heads

## Resumen

Kindi MTP heads es un artefacto de inferencia, no un modelo de lenguaje completo. Se trata de un conjunto de cabezas de predicción multítoken (MTP, *multi-token prediction*) diseñadas para actuar como borrador en un esquema de decodificación especulativa dentro de Kindi, el motor de inferencia para GPU de bajo coste desarrollado por Amir Husain. El artefacto se publica como complemento del modelo base Ternary-Bonsai-2-2B de Prism ML, un modelo de 2B parámetros con pesos ternarios.

La función del head es proponer los tokens siguientes de forma anticipada; el modelo principal verifica todas las propuestas en una sola pasada y Kindi conserva únicamente las que coinciden con la distribución del modelo base. El resultado es un texto idéntico al que produciría el modelo sin el head, con un incremento de velocidad medido de entre el 7 % y el 11 % en tarjetas RTX 3060 y RTX 3080 en decodificación voraz y contextos de hasta 8K tokens.

Su relevancia es acotada pero concreta: demuestra que es posible obtener aceleración en GPUs de consumo mediante decodificación especulativa con un head de apenas 61 MB, sin reentrenar ni modificar el modelo principal. El repositorio es de tamaño reducido (0,1 GB) y no contiene pesos en formato estándar (safetensors o GGUF), sino un único fichero `.npz` propietario que solo Kindi puede leer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de prediccion multítoken (MTP) para decodificacion especulativa sobre el modelo base Ternary-Bonsai-2-2B |
| Parametros totales | No disponible (el fichero de pesos ocupa 60.960.552 bytes; el numero de parametros del head no se declara) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 8K tokens con el head activo; por encima de 8K, Kindi lo desactiva |
| Tipos de cuantizacion | No disponible (el head se distribuye en un unico formato `.npz`; el modelo base usa pesos ternarios) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` propietario (`kindi-mtp-2b-v1.npz`), legible solo por Kindi |

## Arquitectura y entrenamiento

El artefacto consiste en cabezas de predicción multítoken acopladas al modelo base Ternary-Bonsai-2-2B. En lugar de generar un token por paso, el head estima varios tokens futuros de forma simultánea; el modelo principal valida el bloque completo en una única pasada y se aceptan solo las posiciones que coinciden con su propia distribución. Este esquema es el habitual en decodificación especulativa y garantiza equivalencia funcional con la generación sin head en modo voraz.

No se han publicado detalles sobre el procedimiento de entrenamiento del head: ni el número de tokens empleados, ni la composición del dataset, ni si se usó destilación, ajuste supervisado o alineación por preferencias. La model card indica únicamente que los pesos derivan de Qwen3.5-2B de Alibaba Cloud y que el head es trabajo propio del autor para el modelo de Prism ML. Tampoco se documenta la innovación técnica interna del head más allá de su integración en el motor Kindi, que lo activa automáticamente en GPUs NVIDIA con tensor cores (RTX 30 o superior) y lo desactiva por encima de 8K tokens porque deja de aportar ganancia.

## Capacidades

- Aceleración de la decodificación del modelo base Ternary-Bonsai-2-2B mediante predicción multítoken y verificación en una sola pasada.
- Preservación exacta de la salida: el texto generado con head es idéntico al generado sin él en decodificación voraz.
- Integración automática en Kindi: el instalador descarga el head y verifica su hash sha256; también puede configurarse manualmente con `KINDI_SPEC=auto` y `KINDI_MTP_HEAD`.
- Activación condicionada al hardware: solo en tarjetas NVIDIA con tensor cores (RTX 30 y posteriores).
- Activación condicionada al contexto: hasta 8K tokens; por encima, Kindi lo desactiva.
- No aporta capacidades nuevas de generación, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo; esas capacidades dependen íntegramente del modelo base.

## Casos de uso

- Servicio de generación de texto en GPU de consumo: desplegar Ternary-Bonsai-2-2B con Kindi en una RTX 3060 o RTX 3080 y activar el head para obtener entre un 7 % y un 11 % más de tokens por segundo en contextos de hasta 8K, sin cambiar la salida.
- Chat interactivo de baja latencia: en conversaciones multi-turno con prompts de hasta 8K tokens, el head reduce el tiempo hasta el primer bloque de tokens verificados, lo que se traduce en respuestas percibidas como más rápidas.
- Procesamiento por lotes de textos cortos y medios: tareas de resumen, clasificación o reescritura con contextos de 512 a 8K tokens se benefician de la ganancia del 8 %-11 % medida en decodificación voraz.
- Inferencia en estaciones de trabajo con una sola GPU: al no requerir hardware de datacenter, permite montar un endpoint de generación en una máquina con RTX 30 o superior y aprovechar el head como optimización gratuita.
- Evaluación de técnicas de decodificación especulativa: el artefacto sirve como referencia práctica para investigadores que quieran medir el impacto de heads MTP sobre modelos ternarios de 2B en hardware de consumo.
- Prototipado de asistentes locales con contexto moderado: aplicaciones de escritorio o edge con ventanas de hasta 8K tokens donde el coste por token importa y no se dispone de A100/H100.

## Benchmarks y rendimiento

Datos publicados por el autor (Kindi 0.4.0, decodificación voraz, mismo prompt y mismo texto, tokens por segundo):

| Tarjeta y contexto | Sin head | Con head | Ganancia |
|---|---|---|---|
| RTX 3060, 512 tokens | 316,9 | 350,7 | +11 % |
| RTX 3060, 8K | 314,4 | 340,3 | +8 % |
| RTX 3080 (190 W), 512 tokens | 370,8 | 409,0 | +10 % |
| RTX 3080 (190 W), 8K | 368,6 | 395,5 | +7 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza del artefacto: no modifica la calidad de la salida del modelo base.

## Requisitos de hardware

- VRAM estimada para el head: aproximadamente 61 MB adicionales sobre el modelo base, dado el tamaño del fichero `kindi-mtp-2b-v1.npz` (60.960.552 bytes).
- GPU compatibles con el head: NVIDIA con tensor cores, es decir, RTX 30 y posteriores (RTX 3060, RTX 3080 y superiores).
- Cabe en GPU de consumo: sí, el head está pensado explícitamente para GPUs de bajo coste; el modelo base de 2B con pesos ternarios también está orientado a ese segmento.
- Opciones de despliegue: exclusivamente Kindi (instalador desde amirhusain.com/kindi). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.npz` es propietario del motor.
- Latencia y throughput: según las cifras del autor, entre 340 y 409 tokens por segundo en RTX 3060 y RTX 3080 respectivamente, con contextos de 512 a 8K tokens.
- Límite operativo: por encima de 8K tokens de contexto, Kindi desactiva el head porque no aporta ganancia.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje y no existen alternativas directamente comparables en el ecosistema abierto con las que contrastar parámetros, contexto o licencia; los heads MTP publicados por otros proyectos no están documentados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base Ternary-Bonsai-2-2B y sin el motor Kindi, el fichero `.npz` no es utilizable.
- Formato propietario: solo Kindi lee el `.npz`; no hay conversión documentada a safetensors, GGUF ni otros formatos estándar.
- Ganancia limitada: la aceleración medida es del 7 %-11 % y solo se sostiene hasta 8K tokens de contexto; por encima, el head se desactiva.
- Dependencia de hardware: requiere GPU NVIDIA con tensor cores (RTX 30 o superior); no se documenta soporte para AMD, Intel ni CPU.
- Sin datos de sesgos ni de alucinación propios: al no alterar la salida, cualquier sesgo o alucinación proviene del modelo base, sobre el que esta ficha no aporta evaluación.
- Idiomas no declarados: la model card no especifica cobertura lingüística; debe consultarse la del modelo base.
- Licencia Apache-2.0, que permite uso comercial, pero con la obligación de conservar los avisos de copyright de Amir Husain, Alibaba Cloud (Qwen3.5-2B) y Prism ML (Ternary-Bonsai-2-2B).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente de las cifras de rendimiento publicadas.
- Fechas de creación y actualización (2026-10-31) posteriores a la mayor parte del ecosistema documentado; conviene verificar la vigencia de los enlaces y del motor Kindi antes de integrarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ahtx/kindi-mtp-heads
- Modelo base Ternary-Bonsai-2-2B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo de origen de los pesos del head, Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Motor Kindi (instalación y documentación): https://amirhusain.com/kindi
- Licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
