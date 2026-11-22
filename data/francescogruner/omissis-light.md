# francescogruner/omissis-light

## Resumen

omissis-light es una versión cuantizada en INT8 del modelo omissis-small, un clasificador de tokens (token-classification) especializado en la detección de datos personales e identificativos (PII) en texto. Lo desarrolla francescogruner como parte del proyecto Omissis, que incluye un programa de escritorio, una extensión de navegador y el código de entrenamiento del modelo completo. Su propósito es permitir la anonimización o pseudonimización de texto antes de enviarlo a servicios de IA, de modo que se cumpla con el RGPD y se evite la fuga de información confidencial.

El modelo base, omissis-small, cuenta con 140,9 millones de parámetros y está construido sobre mmBERT-small. omissis-light lo comprime sin reentrenamiento: reduce el tamaño de 563 MB a 90 MB (más 34 MB de tokenizer), lo que lo hace apto para su ejecución en dispositivos móviles y en equipos con recursos limitados. Utiliza una arquitectura ModernBERT y se distribuye únicamente en formato ONNX, por lo que funciona con onnxruntime sin necesidad de PyTorch.

La relevancia actual de omissis-light radica en que ofrece una solución ligera y multilingüe (italiano, inglés, alemán, francés, español, neerlandés) para la protección de datos en el propio dispositivo (on-device), con una licencia Apache 2.0 que permite uso comercial. Mantiene las mismas 41 etiquetas y umbrales de decisión que el modelo original, con una puntuación de 0,910 en el benchmark público frente a 0,912 del modelo completo, lo que supone una pérdida de precisión mínima a cambio de una reducción de tamaño de más del 80%.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parámetros totales | 140,9 M (modelo base omissis-small) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (pesos a 8 bits, con matrices enteras a 7 bits para compatibilidad x86 sin VNNI) |
| Idiomas soportados | italiano (it), inglés (en), alemán (de), francés (fr), español (es), neerlandés (nl), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, ~90 MB) + tokenizer.json (~34 MB) |

## Arquitectura y entrenamiento

omissis-light es una versión comprimida de omissis-small, que a su vez se basa en mmBERT-small, un transformer encoder de tipo ModernBERT con 140,9 millones de parámetros. La compresión se realizó sin reentrenamiento: la tabla de vocabulario (256.000 filas de 384 números, que representa el 70% del modelo completo) se almacena de forma híbrida; los 64.000 tokens más frecuentes (98,6% de los tokens encontrados en los textos de entrenamiento) conservan su propia fila a 8 bits, mientras que las 192.000 filas restantes se reconstruyen a partir de 96 componentes compartidos. El resto de pesos se almacenan a 8 bits en lugar de 32, y 66 de las 90 matrices de pesos se calculan con enteros (proyecciones de atención y primera matriz de cada bloque feed-forward), mientras que las otras 24 se calculan en coma flotante para preservar la precisión.

Los datos de entrenamiento del modelo base incluyen múltiples conjuntos de datos especializados en PII y anonimización: ai4privacy/pii-masking-openpii-1m, nvidia/Nemotron-PII, gretelai/gretel-pii-masking-en-v1, gretelai/synthetic_pii_finance_multilingual, piimb/privy, dglover1/mapa-eur-lex, Wismut/nym-pii-multilingual-data, mattmdjaga/text-anonymization-benchmark-train y urchade/synthetic-pii-ner-mistral-v1. No se especifica el número total de tokens ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la incorporación de umbrales de decisión dentro de los propios pesos, lo que hace que el modelo sea cauteloso por construcción: una palabra se clasifica como no sensible solo si el modelo está al menos un 93% seguro (98% para nombres de empresas, 40% para nombres de dominio).

## Capacidades

- Detección de entidades nombradas (NER) para 41 etiquetas en formato BIO, centradas en datos personales e identificativos.
- Identificación de 28 tipos de identificadores que siempre deben enmascararse: personas y contactos (PERSONA, EMAIL, TELEFONO, INDIRIZZO, CAP, CITTA, DATA_NASCITA), identificadores (CF, PIVA, DOC_ID, TARGA, ID_VEICOLO, ID_PRATICA, CATASTO, ID_UTENZA), pagos (IBAN, CARTA, CARTA_SEC), organizaciones (ORG) y TI (IP, MAC, HOSTNAME, DOMINIO, URL, ACCOUNT, SEGRETO, ID_CLOUD, ID_DISPOSITIVO).
- Detección de 13 etiquetas adicionales que identifican solo en combinación con otros datos o que corresponden a categorías especiales: DATA, ORA, ETA, GENERE, TITOLO, PROFESSIONE, ISTRUZIONE, ORIGINE, LUOGO, SALUTE, RELIGIONE, POLITICA, ORIENTAMENTO.
- Capacidad multilingüe para italiano, inglés, alemán, francés, español y neerlandés.
- Funcionamiento en dispositivo (on-device) sin necesidad de conexión a servicios externos, gracias a su formato ONNX y su reducido tamaño.
- No se menciona soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso, ya que es un modelo de clasificación de tokens y no generativo.

## Casos de uso

- Anonimización de textos antes de enviarlos a servicios de IA: el modelo detecta y permite sustituir datos personales por marcadores como `[PERSONA_1]` o `[IBAN_2]`, cumpliendo con el RGPD y evitando la exposición de información sensible en APIs de terceros.
- Protección de datos en aplicaciones móviles: al ocupar solo 90 MB y ejecutarse con onnxruntime, puede integrarse en apps de mensajería o correo para filtrar PII localmente antes de sincronizar o compartir contenido.
- Cumplimiento normativo en atención al cliente: los sistemas de ticketing o chat pueden usar el modelo para redactar automáticamente datos personales en conversaciones multi-turno antes de almacenarlas o analizarlas.
- Enmascaramiento en pipelines de datos para entrenamiento de modelos: permite anonimizar grandes volúmenes de texto (por ejemplo, informes financieros o historiales) antes de usarlos en el desarrollo de otros sistemas de IA.
- Extensión de navegador para privacidad: integrada en la extensión del proyecto Omissis, detecta y advierte sobre la presencia de datos personales en formularios o textos antes de que el usuario los envíe.
- Procesamiento de documentos legales o sanitarios: identifica nombres, direcciones, números de identificación y datos de salud para su pseudonimización en entornos donde la confidencialidad es crítica.
- Filtrado de datos en herramientas de desarrollo: detecta IPs, hostnames, cuentas y secretos en logs o configuraciones para evitar su inclusión en repositorios públicos o entornos de depuración.

## Benchmarks y rendimiento

| Benchmark | omissis-light | omissis-small |
|---|---|---|
| Puntuación en benchmark público (no especificado) | 0,910 | 0,912 |

No se han publicado resultados detallados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible, ya que el modelo está orientado a clasificación de tokens y no a generación de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, ya que el modelo está diseñado para ejecutarse en CPU mediante onnxruntime; el tamaño en disco es de 90 MB (modelo) + 34 MB (tokenizer).
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU y dispositivos móviles. Puede ejecutarse en cualquier CPU x86 o ARM moderna.
- Cabe en GPU consumer: sí, pero no es necesario; su reducido tamaño permite ejecutarlo en Raspberry Pi, teléfonos móviles y navegadores.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider), sin necesidad de PyTorch. No se mencionan vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Tamaño | Puntuación benchmark |
|---|---|---|---|---|---|---|
| omissis-light | 140,9 M (base) | no disponible | ONNX | Apache 2.0 | 90 MB | 0,910 |
| omissis-small | 140,9 M | no disponible | no disponible | Apache 2.0 | 563 MB | 0,912 |
| omissis-base | no disponible | no disponible | no disponible | Apache 2.0 | 1,2 GB | no disponible |

No se dispone de información sobre otros modelos comparables de detección de PII en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para detectar PII, pero puede cometer errores (falsos negativos y falsos positivos) debido a la naturaleza probabilística de la clasificación; los umbrales internos buscan minimizar los falsos negativos, pero no los eliminan por completo.
- La compresión INT8 introduce una ligera pérdida de precisión (0,910 frente a 0,912), que puede traducirse en una detección marginalmente menor en casos límite.
- Aunque soporta varios idiomas, su rendimiento puede variar entre ellos; el italiano es el idioma principal (las etiquetas están en italiano) y el modelo se entrenó con datos multilingües, pero no se especifica la cobertura exacta por idioma.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que los datos de entrenamiento no impongan restricciones adicionales.
- El modelo no es generativo, por lo que no puede utilizarse para tareas de razonamiento, generación de texto o código.
- No se especifica la longitud máxima de contexto soportada, lo que puede ser relevante para textos muy largos.
- El modelo puede presentar sesgos heredados de los datos de entrenamiento, especialmente en la detección de nombres o entidades según su origen.

## Enlaces

- [Hugging Face: francescogruner/omissis-light](https://huggingface.co/francescogruner/omissis-light)
- [Modelo base: francescogruner/omissis-small](https://huggingface.co/francescogruner/omissis-small)
- [Modelo de mayor tamaño: francescogruner/omissis-base](https://huggingface.co/francescogruner/omissis-base)
- [Repositorio del proyecto Omissis en GitHub](https://github.com/francescogruner/omissis)
- [mmBERT-small (modelo base original)](https://huggingface.co/jhu-clsp/mmBERT-small)
