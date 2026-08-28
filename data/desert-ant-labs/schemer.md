# desert-ant-labs/schemer

## Resumen

Schemer es un modelo de extracción estructurada de texto a JSON, desarrollado por Desert Ant Labs, un laboratorio europeo especializado en modelos de IA para dispositivos con recursos limitados. A diferencia de los modelos generativos de lenguaje, Schemer no produce texto libre: recibe un esquema JSON definido por el desarrollador y un documento de entrada, y devuelve un objeto JSON que cumple exactamente ese esquema. Cada campo se decodifica mediante una cabeza especializada para su tipo (etiquetas, números, fechas, booleanos, cadenas), lo que garantiza que los valores extraídos respeten las restricciones declaradas.

El modelo tiene 211 millones de parámetros y está diseñado para ejecutarse completamente offline en dispositivos móviles, navegadores y sistemas embebidos. Soporta 13 idiomas (incluido el español) con una dispersión de precisión entre idiomas de solo 0,075 puntos. Su arquitectura se basa en un encoder mmBERT-base podado (22 capas, vocabulario reducido a 103 000 tokens) combinado con un lector de atención cruzada y un harness determinista de post-procesamiento. La ventana de contexto total es de 1216 tokens (esquema + documento), lo que permite procesar documentos de aproximadamente 1100 tokens (unas tres páginas).

Schemer es relevante porque ofrece tres garantías que ningún extractor generativo proporciona: tipado por construcción (los valores siempre cumplen el esquema), detección de ausencia (los campos no mencionados devuelven `null` con una precisión de 0,91 frente a 0,18-0,43 de los LLM) y extracción verbatim con offsets de caracteres, lo que permite auditar alucinaciones mediante una simple comprobación de subcadenas. El modelo está disponible en formato PyTorch (int8, int4 AWQ y fp32), ONNX y Core ML, y se distribuye bajo una licencia propia de código disponible (source-available).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base podado (22 capas) + reader de atención cruzada + heads por tipo + harness determinista |
| Parametros totales | 211 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1216 tokens en total (esquema + documento); aproximadamente 1100 tokens de documento útil |
| Tipos de cuantizacion | int8 por fila (218 MB), int4 AWQ (111 MB), fp32 (850 MB), int4 ONNX, int4 Core ML |
| Idiomas soportados | danés, alemán, inglés, español, francés, italiano, japonés, neerlandés, noruego, polaco, portugués, sueco, chino |
| Licencia | desert-ant-labs-source-available-1.0 (enlace: https://license.desertant.com/1.0) |
| Formato de pesos | PyTorch (`.pt`), ONNX (`.onnx`), Core ML (`.mlpackage.zip`) |

## Arquitectura y entrenamiento

Schemer no es un transformer generativo estándar, sino un modelo de extracción discriminativo. La arquitectura consta de tres componentes principales:

- **Encoder**: un mmBERT-base podado de 22 capas con un vocabulario reducido de 256 000 a 103 000 tokens. Codifica conjuntamente el resumen del esquema y el documento de entrada, separados por un delimitador. Admite dos formas de entrada compiladas: 256 tokens (para registros cortos) y 1216 tokens (para documentos largos).
- **Reader**: una única capa de atención cruzada compartida que opera sobre los estados del encoder.
- **Heads de decodificación**: cabezas delgadas específicas por tipo de campo: entailment de etiquetas, clasificación booleana de tres vías (ausente/falso/verdadero), etiquetado BIO de spans para cadenas y arrays con puertas de presencia entrenadas, y decodificadores de componentes para fechas y números.
- **Harness determinista**: post-procesamiento que incluye parseo de números según locale, composición ISO de fechas, léxicos de fechas relativas en 13 idiomas y reglas de formato. Se distribuye como datos JSON más una implementación de referencia; cada puerto del SDK debe pasar las pruebas de conformidad bit a bit.

No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de tokens, composición, metodología como RLHF o DPO). La información disponible solo indica que el encoder se basa en mmBERT-base podado y que el modelo fue evaluado en 9021 registros held-out. El harness maneja los esquemas anidados mediante segmentación y recursión determinista, lo que logra una puntuación de 0,99 en la evaluación interna de esquemas anidados.

## Capacidades

- Extracción de campos tipados: cadenas, números (con rango y unidades), booleanos, fechas/horas (ISO 8601), arrays y objetos anidados.
- Cumplimiento estricto del esquema: los valores devueltos respetan las restricciones declaradas (por ejemplo, un número siempre está dentro del rango `min`/`max` especificado).
- Detección de ausencia: los campos no mencionados en el texto devuelven `null` en lugar de inventar contenido.
- Resolución de expresiones relativas de fecha y hora en 13 idiomas, incluyendo errores tipográficos (por ejemplo, "tomorow" o "i morgen kl 15").
- Conversión de unidades de duración (por ejemplo, "una hora" a 60 minutos).
- Extracción verbatim con offsets de caracteres: las cadenas extraídas son subcadenas exactas del texto de entrada.
- Tolerancia a errores tipográficos y variaciones ortográficas en los valores extraídos.
- Funcionamiento completamente offline, sin necesidad de conexión a red.
- Multilingüe: 13 idiomas con una dispersión de precisión entre idiomas de 0,075 puntos.
- No genera texto libre; no es un chatbot ni un modelo de completado.

## Casos de uso

- **Extracción de eventos de calendario**: dado un correo o mensaje con "Reunión con Ana mañana a las 3 pm durante una hora", Schemer devuelve `{"title": "reunión con Ana", "start": "2026-07-06T15:00", "duration_min": 60}`. Es adecuado porque resuelve fechas relativas y convierte unidades de duración automáticamente.
- **Parseo de facturas y recibos**: extracción de campos como número de factura, importe total, fecha de emisión y proveedor desde texto libre. La garantía de tipado numérico y formato de fecha elimina la necesidad de capas de validación posteriores.
- **Extracción de metadatos de documentos legales**: campos como partes involucradas, fechas de contrato, importes y cláusulas. La extracción verbatim con offsets permite auditar cada valor contra el documento original.
- **Procesamiento de formularios web o móviles**: rellenado automático de formularios a partir de texto pegado por el usuario (por ejemplo, dirección, nombre, teléfono). Al ser un modelo pequeño, se ejecuta en el dispositivo sin enviar datos a servidores.
- **Análisis de reseñas de productos**: extracción de aspectos como valoración, características mencionadas y problemas reportados desde reseñas de usuarios. La detección de ausencia evita campos vacíos o inventados.
- **Asistentes de atención al cliente**: en un flujo de chat, Schemer puede extraer intenciones y entidades de los mensajes del usuario (por ejemplo, tipo de incidencia, número de pedido, fecha de compra) y pasarlas a un sistema de tickets. Su baja latencia (8,7 ms por pasada en Apple Neural Engine) lo hace apto para interacción en tiempo real.
- **Extracción de datos de contactos**: a partir de firmas de correo o tarjetas de visita escaneadas, extraer nombre, cargo, empresa, correo y teléfono. El soporte multilingüe cubre mercados europeos y asiáticos.

## Benchmarks y rendimiento

La evaluación publicada se realizó sobre 9021 registros held-out en siete segmentos de uso (registros cortos 0,30, documentos largos 0,15, documentos largos con distractores del mismo tipo 0,15, reseñas y registros 0,15, calendario 0,10, dominios factorizados 0,10, esquemas anidados 0,05), en 13 idiomas y con esquemas no vistos durante el entrenamiento. El scorer es independiente del orden y sensible a la ausencia.

| Metrica | Valor (int8) | Valor (int4 AWQ) |
|---|---|---|
| Puntuacion global (ponderada por uso) | 0,800 | 0,793 |
| Deteccion de ausencia | 0,91 | no disponible |
| Evaluacion de esquemas anidados | 0,99 | no disponible |
| Dispersión de precision entre idiomas | 0,075 | no disponible |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) porque Schemer no es un modelo generativo de propósito general. La documentación menciona que en la tarea de detección de ausencia, los LLM y extractores de span evaluados (incluyendo FunctionGemma, NuExtract-2.0 y GLiNER2) obtuvieron puntuaciones entre 0,18 y 0,43, frente a 0,91 de Schemer, pero no se proporcionan los resultados completos de esos modelos en otras métricas.

## Requisitos de hardware

- **RAM**: aproximadamente 200 MB en tiempo de ejecución.
- **Tamaño de artefactos**: 218 MB en int8 (calidad completa), 111 MB en int4 AWQ, 850 MB en fp32 (solo para conversión, no para despliegue).
- **GPU**: no requiere GPU dedicada. Está diseñado para CPU, Apple Neural Engine (ANE), Android y navegadores.
- **Rendimiento en ANE**: 8,7 ms por pasada del encoder en el shape de 1216 tokens; 8,1 ms en el shape de 256 tokens (validado en dispositivo).
- **Despliegue**: Core ML (iOS/macOS, shapes de 256 y 1216 tokens, residente en ANE), ONNX (navegador o Android), PyTorch (para integración en servidores o prototipado).
- **Latencia**: al ser un modelo de 211M parámetros, es viable para inferencia en tiempo real en dispositivos móviles. No se han publicado cifras de throughput en servidores.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de modelos comparables (FunctionGemma, NuExtract-2.0, GLiNER2) en la información proporcionada. La comparación es cualitativa:

| Modelo | Tipo | Tamano | Enfoque | Contexto | Licencia |
|---|---|---|---|---|---|
| Schemer | Extractor discriminativo | 211M | Relleno de esquema JSON tipado | 1216 tokens | source-available (propia) |
| FunctionGemma | LLM generativo con tool calling | no disponible | Generación de JSON mediante instrucciones | no disponible | no disponible |
| NuExtract-2.0 | LLM generativo de extracción | no disponible | Extracción guiada por plantilla | no disponible | no disponible |
| GLiNER2 | Extractor de spans | no disponible | Reconocimiento de entidades por spans | no disponible | no disponible |

La principal diferencia es que Schemer no genera texto: decodifica cada campo con una cabeza especializada, lo que elimina la necesidad de validación posterior y reduce drásticamente la tasa de alucinación en campos ausentes. Los modelos generativos requieren prompts cuidadosos y validación externa, y suelen fallar en la detección de ausencia.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana total de 1216 tokens (esquema + documento) restringe el tamaño del texto procesable a aproximadamente 1100 tokens. Documentos más largos se truncan.
- **No es un generador de texto**: no sirve para tareas de chat, redacción o completado. Solo extrae campos definidos en un esquema.
- **Esquema obligatorio**: el llamador debe proporcionar un esquema JSON válido. No funciona sin esquema.
- **Riesgo de alucinación residual**: aunque la extracción verbatim reduce el riesgo, los campos numéricos y de fecha se componen a partir de componentes decodificados y podrían contener errores si el texto es ambiguo.
- **Sesgos potenciales**: al estar basado en mmBERT, puede heredar sesgos del preentrenamiento. No se han publicado auditorías de sesgo específicas.
- **Licencia**: la licencia `desert-ant-labs-source-available-1.0` es de código disponible, no una licencia de código abierto estándar. Es necesario revisar los términos en https://license.desertant.com/1.0 para conocer las restricciones de uso comercial, modificación y redistribución.
- **Estado de pre-lanzamiento**: la documentación indica que es una "pre-release privada" y que los pesos están alojados antes del lanzamiento del SDK. Podría haber cambios en versiones finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/schemer
- Página oficial del modelo: https://desertant.com/models/schemer/
- Sitio web de Desert Ant Labs: https://desertant.com/
- GitHub de Desert Ant Labs: https://github.com/Desert-Ant-Labs
- Licencia: https://license.desertant.com/1.0
