# DeTars/DeTars-PII-v1

## Resumen

DeTars-PII-v1 es un modelo de detección y anonimización de datos personales (PII) desarrollado por DeTars, orientado a ejecución local en el escritorio del usuario. Se construye como un adaptador LoRA sobre el modelo base fastino/gliner2-privacy-filter-PII-multi y se distribuye como un paquete para el runtime propietario de DeTars (rt6): un codificador ONNX, cabezas en NumPy, tokenizador y un manifiesto de enrutado. No es un checkpoint estándar de Transformers, por lo que no se puede cargar con `AutoModel`.

El modelo resuelve un problema concreto: identificar nombres, empresas, direcciones, teléfonos, correos, identificadores fiscales, tarjetas bancarias, IPs y claves de API en 27 idiomas antes de que el texto salga hacia un modelo en la nube. Forma parte de la función Auto-Privacy de la aplicación de escritorio DeTars, que sustituye los datos reales por marcadores de posición y los restaura al recibir la respuesta.

Su relevancia actual radica en la combinación de cobertura multilingüe amplia (23 lenguas europeas más chino, japonés y coreano), un consumo de memoria bajo (unos 0,8 GB en CPU, sin GPU) y unos resultados de evaluación que el autor sitúa por delante de alternativas como Fastino GLiNER2-PII, NVIDIA GLiNER-PII y OpenAI Privacy Filter en las métricas de fuga y F1 estricto. La licencia Apache 2.0 facilita su integración, aunque el formato de despliegue está atado al runtime de DeTars.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador ONNX con cabezas NumPy; adaptador LoRA (rango 16) sobre GLiNER2; enrutado por escritura (ruta Han para chino, ruta multilingüe para el resto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como bundle ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | 27: en, de, fr, es, it, nl, pt, bg, pl, cs, sv, ro, lt, et, hr, fi, lv, hu, sk, sl, da, el, sr, ja, ko, zh, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (codificador) + cabezas NumPy + tokenizador + manifiesto de enrutado; no es un checkpoint Transformers |

## Arquitectura y entrenamiento

El modelo sigue un enfoque de token-classification basado en GLiNER2, un modelo de reconocimiento de entidades que trabaja con prompts de tipos de entidad. Sobre el modelo base fastino/gliner2-privacy-filter-PII-multi se aplica un adaptador LoRA de rango 16 con umbral de decisión 0,65, entrenado específicamente para lenguas europeas en la release 3.1. La inferencia se organiza en dos rutas que comparten un único codificador: una ruta Han dedicada al chino y una ruta multilingüe para el resto de idiomas. El texto se enruta según su escritura.

El entrenamiento utiliza el dataset ai4privacy/pii-masking-openpii-1.5m. La model card indica que el conjunto de evaluación europeo se mantuvo reservado y congelado antes del entrenamiento y se puntuó una sola vez, y que los resultados provienen de una única semilla de entrenamiento. La release 3.1 introduce el nuevo adaptador multilingüe y, según el autor, reduce las falsas activaciones sobre negativos difíciles de 4/40 a 1/40, baja el sobre-enmascarado en coreano un 31 % y mejora el throughput un 7 % sin cambiar el consumo de memoria. La ruta china es idéntica a la de la versión 3.0.

## Capacidades

- Detección de nombres completos de personas, empresas y organizaciones, direcciones postales con número de portal, teléfonos, correos electrónicos, identificadores gubernamentales, tarjetas y cuentas bancarias, identificadores fiscales y de organización, fechas de nacimiento, direcciones IP y claves de API.
- Anonimización con marcadores de posición y restauración posterior de los valores originales (flujo de Auto-Privacy).
- Procesamiento multilingüe en 27 idiomas con un único codificador compartido.
- Enrutado automático por escritura: ruta Han para chino y ruta multilingüe para el resto.
- Ejecución local en CPU sin GPU y sin llamadas de red, con un pico de memoria de aproximadamente 0,8 GB.
- Rendimiento aproximado de 850 caracteres por segundo en una CPU Apple M2.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento; el modelo es exclusivamente de clasificación de tokens para PII.

## Casos de uso

- Redacción de PII antes de enviar prompts a un LLM en la nube: la aplicación intercepta el texto, sustituye nombres, correos y teléfonos por marcadores y los restaura en la respuesta, de modo que el proveedor del modelo nunca ve los datos reales.
- Cumplimiento de RGPD en herramientas internas: integración en formularios, chats de soporte o sistemas de tickets para enmascarar datos personales antes de almacenarlos o registrarlos en logs.
- Procesamiento de documentos en el escritorio: análisis local de contratos, facturas o currículos para extraer y anonimizar identificadores fiscales, cuentas bancarias y direcciones sin subir el documento a un servidor.
- Saneado de datasets para entrenamiento: eliminación de PII de corpus multilingües antes de compartirlos o publicarlos, aprovechando la cobertura de 27 idiomas.
- Filtrado de correos y mensajes: detección de direcciones, teléfonos y claves de API en cuerpos de correo antes de reenviarlos o archivarlos en sistemas externos.
- Protección de registros de atención al cliente: anonimización de conversaciones multi-idioma antes de enviarlas a herramientas de analítica o de control de calidad.
- Detección de secretos en repositorios y pipelines: identificación de claves de API e IPs en textos generados o registrados por aplicaciones, con ejecución local que evita exponer el contenido a terceros.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. En las métricas de fuga (leak) y sobre-enmascarado (over-mask) menor es mejor; en F1 estricto mayor es mejor.

Chino, japonés y coreano:

| Metrica | DeTars-PII | Fastino | NVIDIA | Urchade | OpenAI PF |
|---|---|---|---|---|---|
| Chino (pii-bench-zh), F1 estricto | 92,1 | 46,1 | 18,6 | 28,2 | 56,2 |
| Japonés, fuga % / sobre-enmascarado | 7,4 / 25,5 | 34,7 / 94,9 | 33,0 / 100,5 | 33,9 / 131,9 | 12,7 / 39,6 |
| Coreano, fuga % con sobre-enmascarado equiparado | 8,2 | 9,2 | 13,1 | 46,0 | 14,7 |

Lenguas europeas (23 idiomas, 2.300 documentos reservados):

| Metrica | DeTars-PII 3.1 | Fastino | NVIDIA | OpenAI PF |
|---|---:|---:|---:|---:|
| Fuga % | 1,69 | 5,97 | 9,91 | 23,41 |
| F1 estricto % | 91,5 | 68,2 | 55,6 | 67,7 |
| Sobre-enmascarado por 1.000 | 9,5 | 5,5 | 12,0 | 6,8 |

El autor señala que estos resultados son autoevaluados y reproducibles, con fuentes y hashes SHA256 en `evaluation-sources.json`, y advierte que la mayoría de los conjuntos de prueba son sintéticos o públicos y que los resultados provienen de una única semilla de entrenamiento.

## Requisitos de hardware

- VRAM: no requiere GPU; el pico de memoria en CPU es de aproximadamente 0,8 GB.
- GPU recomendadas: no aplica; el modelo está diseñado para ejecución en CPU.
- Cabe en cualquier equipo de consumo: se ejecuta en CPU, con rendimiento medido de unos 850 caracteres por segundo en un Apple M2.
- Opciones de despliegue: runtime propietario de DeTars (rt6) mediante el paquete `packages/privacy-detector`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint Transformers.
- Latencia y throughput: aproximadamente 850 caracteres por segundo en CPU Apple M2; no se publican cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeTars-PII-v1 | GLiNER2 + LoRA, token-classification | 27 | Apache 2.0 | ONNX + NumPy, runtime propio | F1 estricto 91,5 en 23 lenguas europeas; fuga 1,69 % |
| Fastino GLiNER2-PII | GLiNER2, token-classification | Multilingüe (no detallado) | no disponible | no disponible | F1 estricto 68,2; fuga 5,97 % en la misma evaluación |
| NVIDIA GLiNER-PII | GLiNER, token-classification | no disponible | no disponible | no disponible | F1 estricto 55,6; fuga 9,91 % |
| OpenAI Privacy Filter | Filtro de privacidad | no disponible | no disponible | no disponible | F1 estricto 67,7; fuga 23,41 % |

Los datos de los modelos comparados proceden de la evaluación del autor de DeTars-PII; no se dispone de especificaciones independientes de parámetros, contexto o licencia para las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo se distribuye como bundle para el runtime rt6 de DeTars y no como checkpoint Transformers; integrarlo fuera de la aplicación requiere el paquete `privacy-detector` en una revisión compatible con el contrato `detars-pii-v3.1-rt6`.
- Los benchmarks son autoevaluados por el autor; parte de los conjuntos de prueba son sintéticos o públicos y el material de validación de Ai4Privacy OpenPII pertenece a la misma familia que parte de los datos de entrenamiento, lo que puede inflar los resultados.
- Los resultados provienen de una única semilla de entrenamiento, por lo que no se documenta la variabilidad entre ejecuciones.
- El modelo trata nombres de empresas y organizaciones como datos privados, una categoría que otras alternativas no incluyen; esto puede producir un sobre-enmascarado mayor en algunos contextos respecto a definiciones más estrechas de PII.
- El sobre-enmascarado es superior al de Fastino (9,5 frente a 5,5 por 1.000 caracteres), lo que puede degradar el contexto en textos con muchas mayúsculas o nombres de producto.
- No se documentan sesgos por idioma, género o procedencia de los nombres; al entrenarse sobre un dataset mayoritariamente sintético, el rendimiento en dominios reales muy específicos (jurídico, médico, técnico) no está validado.
- No se especifican la longitud de contexto ni los parámetros totales, lo que dificulta estimar el comportamiento con documentos muy largos.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime propietario de DeTars puede condicionar la portabilidad y el soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeTars/DeTars-PII-v1
- Aplicación DeTars: https://detars.xyz
- Modelo base: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Benchmark chino: https://huggingface.co/datasets/wan9yu/pii-bench-zh
- Documento de evaluación del autor: `EVALUATION.md` en el repositorio del modelo
- Fuentes de evaluación: `evaluation-sources.json` en el repositorio del modelo
