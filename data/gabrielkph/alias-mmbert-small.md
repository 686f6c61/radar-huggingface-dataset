# Gabrielkph/alias-mmbert-small

## Resumen

Alias mmBERT-small es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales (PII) en textos en francés e inglés. Lo desarrolla Gabrielkph como componente del proyecto Alias, una herramienta de anonimización previa al envío de texto a modelos de lenguaje. Se trata de un fine-tuning de `jhu-clsp/mmBERT-small`, un transformer encoder de tipo ModernBERT con 140,6 millones de parámetros.

El modelo resuelve un problema concreto: identificar y enmascarar información personal sensible (nombres, direcciones, correos, teléfonos, IBAN, identificadores nacionales, fechas de nacimiento y números de expediente) antes de que el texto llegue a un LLM. En Alias funciona junto con reglas deterministas (validación de checksums y palabras clave), de modo que el modelo aporta la capa de reconocimiento semántico y las reglas cubren los patrones verificables.

Su relevancia actual radica en la creciente necesidad de pipelines de privacidad para aplicaciones con LLM en entornos regulados (RGPD). Al estar entrenado exclusivamente con datos sintéticos y públicos, evita el riesgo legal de usar datos personales reales en el entrenamiento, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-small`) |
| Parametros totales | 140.648.081 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 512 tokens con solapamiento de 128 en inferencia |
| Tipos de cuantizacion | no cuantizado (la cuantizacion int8 dinamica degrada la precision; no se documentan otros formatos) |
| Idiomas soportados | fr, en |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | token-classification (etiquetado BIO) |
| Etiquetas | PERSON, ADDRESS, EMAIL, PHONE, IBAN, NATIONAL_ID, BIRTH_DATE, IDENTIFIER |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `jhu-clsp/mmBERT-small`, un encoder de la familia ModernBERT orientado a clasificación de tokens. La cabeza de clasificación produce etiquetas BIO sobre ocho tipos de entidad. En inferencia, los textos largos se procesan en ventanas de 512 tokens con 128 tokens de solapamiento.

El entrenamiento se realizó exclusivamente con datos sintéticos y públicos, sin datos personales reales: documentos generados a partir de una rejilla de tipos, dominios y formatos con identidades falsas (Faker, licencia MIT) y spans conocidos por construcción; WikiNER francés (CC BY 4.0; Nothman et al., 2013) con nombres convertidos a `PERSON`; y el dataset `synthetic_pii_finance_multilingual` de Gretel (Apache-2.0) en francés e inglés. Se entrenó durante 3 épocas con learning rate 3e-5, batch de 16 y ventanas de 512 tokens. La elección del modelo base se hizo entre tres candidatos (mmBERT-small, XLM-RoBERTa base y mDeBERTa-v3 base) mediante un criterio definido antes del entrenamiento y documentado en `docs/TRAINING.md` del repositorio.

## Capacidades

- Detección de entidades PII mediante etiquetado BIO: `PERSON`, `ADDRESS`, `EMAIL`, `PHONE`, `IBAN`, `NATIONAL_ID` (NIR francés, SSN estadounidense, NINO británico), `BIRTH_DATE` e `IDENTIFIER` (número de expediente, contrato o cliente de una persona).
- Anonimización de textos en francés e inglés como paso previo al envío a un LLM.
- Procesamiento de documentos largos mediante ventanas de 512 tokens con solapamiento de 128.
- Integración con reglas deterministas del proyecto Alias (checksums de identificadores nacionales y palabras clave para fechas de nacimiento).
- No soporta tool calling, agentes, visión ni audio: es un encoder de clasificación, no un modelo generativo.
- No etiqueta nombres de empresas, direcciones de empresa, centralitas ni números de factura.

## Casos de uso

- Anonimización previa a LLM en atención al cliente: el modelo detecta nombres, correos y teléfonos en los mensajes de los usuarios antes de enviarlos a un modelo generativo, reduciendo la exposición de datos personales en la cadena de procesamiento.
- Cumplimiento del RGPD en pipelines de datos: integrado como paso de preprocesamiento, permite enmascarar PII en logs, tickets y transcripciones antes de almacenarlos o analizarlos.
- Procesamiento de documentos financieros: la etiqueta `IBAN` y el dataset financiero sintético de entrenamiento lo hacen adecuado para detectar datos bancarios en extractos y comunicaciones, combinado con las reglas de checksum de Alias.
- Redacción de documentos legales o de RRHH: detección de identificadores nacionales (NIR, SSN, NINO) y números de expediente antes de compartir borradores con herramientas externas.
- Enmascaramiento en pipelines de investigación con textos clínicos o administrativos: al no haberse entrenado con datos reales, puede desplegarse sin arrastrar obligaciones derivadas de datos personales de terceros.
- Filtro de privacidad en herramientas de escritura asistida: ejecución en CPU (aproximadamente un segundo por página de 3.000 caracteres en 4 núcleos) permite integrarlo en aplicaciones de escritorio o servicios ligeros sin GPU.

## Benchmarks y rendimiento

| Conjunto | Precision | Recall | Tasa de fuga |
|---|---|---|---|
| Split de test sintético (4.200 documentos, leído una vez) | 0,970 | 0,980 | 1,1 % |
| 200 documentos escritos por un LLM ausente del entrenamiento | 0,94 | 0,93 | 3,5 % |

Precision y recall estrictos (etiqueta y ambos límites del span). La tasa de fuga es la proporción de valores personales aún legibles por completo tras el enmascaramiento. No se ha medido sobre documentos reales. En CPU sin cuantizar: aproximadamente un segundo por página de 3.000 caracteres en 4 núcleos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 140,6 millones de parámetros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera la inferencia, pero no es necesaria.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de memoria.
- Opciones de despliegue: transformers (librería nativa), con integración en el paquete `alias-pii` del proyecto Alias. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente un segundo por página de 3.000 caracteres en CPU de 4 núcleos, sin cuantizar. La cuantización int8 dinámica destruye la precisión según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Alias mmBERT-small | 140,6 M | ventanas de 512 tokens | fr, en | MIT | Especializado en PII, entrenado solo con datos sintéticos y públicos |
| `jhu-clsp/mmBERT-small` (base) | 140,6 M | no disponible | multilingüe | no disponible | Modelo base sin fine-tuning para PII |
| XLM-RoBERTa base | no disponible | 512 tokens | multilingüe | MIT | Candidato descartado en la selección del modelo base |
| mDeBERTa-v3 base | no disponible | 512 tokens | multilingüe | MIT | Candidato descartado en la selección del modelo base |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha evaluado con texto sintético y texto escrito por un LLM: los documentos reales pueden contener formatos no vistos durante el entrenamiento.
- Fuera de distribución, sus puntos débiles son las fechas de nacimiento y los identificadores nacionales. Las reglas de Alias añaden identificadores nacionales por checksum y fechas anunciadas por palabra clave; una fecha sin palabra clave puede pasar desapercibida (11 % de fuga en texto de validación escrito por LLM, según `docs/DETECTOR.md`).
- Ningún detector tiene recall perfecto: Alias es un componente, no una garantía de anonimato.
- La cuantización int8 dinámica destruye la precisión del modelo.
- Solo cubre francés e inglés.
- No etiqueta nombres de empresa, direcciones de empresa, centralitas ni números de factura.
- No se han publicado mediciones sobre documentos reales, por lo que el rendimiento en producción es incierto.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene verificar las licencias de los datos de entrenamiento subyacentes (WikiNER CC BY 4.0, Gretel Apache-2.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gabrielkph/alias-mmbert-small
- Repositorio del proyecto Alias: https://github.com/gabrielkpo/alias
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Documentación de entrenamiento (referenciada): `docs/TRAINING.md` en el repositorio de Alias
- Documentación del detector (referenciada): `docs/DETECTOR.md` en el repositorio de Alias
