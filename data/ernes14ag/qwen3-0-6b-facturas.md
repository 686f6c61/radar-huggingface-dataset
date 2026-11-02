# Ernes14AG/qwen3-0.6b-facturas

## Resumen

Qwen3-0.6B · extractor de facturas a JSON es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario Ernes14AG y publicado en HuggingFace bajo licencia Apache 2.0. Su propósito es convertir texto plano procedente de facturas, tickets y correos de proveedor —típicamente la salida de un OCR— en un objeto JSON con estructura fija de diez campos, incluyendo datos fiscales del emisor, líneas de detalle, base imponible, IVA y total.

El modelo resuelve un problema muy concreto de automatización documental: la extracción estructurada de datos de facturación en español sin necesidad de infraestructura pesada. Con solo 596 millones de parámetros, está diseñado para ejecutarse en hardware modesto, incluso en CPU o GPUs de consumo, lo que lo hace atractivo para pipelines de contabilidad, gestoría o ERP donde el coste por documento y la latencia importan más que la capacidad de razonamiento general.

El ajuste se realizó sobre 200 facturas sintéticas en español generadas a partir de 12 proveedores ficticios. El autor reporta un 88 % de facturas perfectas (todos los campos correctos) sobre un conjunto de prueba de 40 facturas no vistas durante el entrenamiento, con un 100 % de JSON válido. Estas cifras proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre el modelo base |
| Parametros totales | 596.049.920 (aproximadamente 0,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | GGUF Q8_0 disponible en el repositorio hermano; otras cuantizaciones no disponibles |
| Idiomas soportados | espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos para transformers) y GGUF (para Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba. Sobre esa base se aplica un ajuste fino con LoRA (Low-Rank Adaptation), técnica que congela los pesos originales e introduce matrices de bajo rango entrenables, reduciendo drásticamente el coste computacional y el tamaño de los artefactos de entrenamiento. El repositorio principal contiene los pesos fusionados en formato safetensors (1,2 GB), listos para su uso con transformers; existe además un repositorio separado con pesos en GGUF para Ollama.

El conjunto de entrenamiento consiste en 200 facturas sintéticas en español, generadas a partir de 12 proveedores ficticios. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla la configuración del adaptador LoRA (rango, alpha, capas objetivo) ni los hiperparámetros de entrenamiento. La innovación principal no es arquitectónica sino de especialización: el modelo está entrenado para responder directamente con el JSON, sin cadena de razonamiento, lo que el autor recomienda forzar desactivando el modo *thinking* de Qwen3.

## Capacidades

- Extracción estructurada de datos de facturas en español a un esquema JSON fijo con diez campos: proveedor, NIF, número de factura, fecha (formato AAAA-MM-DD), líneas de detalle (descripción, cantidad, precio unitario), base imponible, porcentaje de IVA y total.
- Generación de JSON válido de forma consistente (100 % reportado por el autor sobre el conjunto de prueba).
- Normalización de fechas al formato ISO 8601 (AAAA-MM-DD), como se observa en el ejemplo de la model card (05/11/2026 → 2026-11-05).
- Normalización de importes y conversión de tipos: cantidades a entero, precios y totales a flotante.
- Procesamiento de texto multi-línea, incluyendo tickets simplificados y facturas con formato de tabla en texto plano.
- Compatibilidad con el parámetro `format="json"` de Ollama, que garantiza la validez sintáctica de la salida.
- Modo de respuesta directa sin razonamiento (`think=False` / `--think=false`), que reduce latencia y evita divagaciones.
- No dispone de capacidades de visión: requiere texto de entrada, por lo que necesita un OCR previo para PDF escaneados o fotografías.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni multilingüismo más allá del español.

## Casos de uso

- Automatización contable en pymes y gestorías: el modelo recibe el texto extraído por OCR de facturas de proveedor y devuelve el JSON listo para insertar en el ERP o en una base de datos, eliminando la introducción manual de datos. Su tamaño reducido permite ejecutarlo en el propio servidor de la gestoría sin costes de API.
- Digitalización de tickets de gasto: para aplicaciones de gestión de dietas y notas de gasto, el modelo convierte tickets simplificados (como el ejemplo de la model card) en registros estructurados con líneas de detalle, base imponible e IVA desglosado.
- Procesamiento por lotes de correos de proveedor: integrado en un pipeline que extrae el cuerpo del correo o el adjunto convertido a texto, el modelo puede procesar cientos de facturas por hora en CPU, clasificando y estructurando la información para su validación posterior.
- Pre-validación fiscal: el JSON de salida permite comprobar automáticamente la coherencia entre base imponible, porcentaje de IVA y total, detectando discrepancias antes de registrar la factura en el sistema.
- Extracción en entornos con requisitos de privacidad: al ejecutarse localmente vía Ollama o transformers, los datos fiscales no salen de la infraestructura de la organización, lo que facilita el cumplimiento del RGPD en el tratamiento de datos de proveedores.
- Prototipado rápido de pipelines documentales: con 0,6 mil millones de parámetros y licencia Apache 2.0, sirve como componente base para validar un flujo de extracción antes de invertir en modelos mayores o en servicios comerciales de document AI.
- Despliegue en dispositivos de borde: su tamaño permite ejecutarlo en mini-PC, Raspberry Pi con suficiente RAM o portátiles sin GPU dedicada, útil para digitalización de facturas en oficinas sin infraestructura cloud.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados proceden de la model card del autor y se refieren a su propio conjunto de evaluación, no a benchmarks estándar:

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Facturas perfectas (todos los campos correctos) | 88 % | 40 facturas sinteticas no vistas en entrenamiento |
| JSON valido | 100 % | 40 facturas sinteticas no vistas en entrenamiento |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y las cifras anteriores no han sido verificadas de forma independiente ni comparadas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en cuantización Q8_0 (tamaño del repositorio GGUF); en FP16 los pesos completos ocupan alrededor de 1,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece latencias muy bajas. Para despliegues de alto throughput, una A100 o H100 no aporta ventajas significativas por el reducido tamaño del modelo, salvo por el procesamiento por lotes masivo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.). También es viable en CPU pura, dado el reducido número de parámetros.
- Opciones de despliegue: Ollama (repositorio GGUF oficial con etiqueta Q8_0), transformers con los pesos safetensors, llama.cpp para GGUF, y potencialmente vLLM o TGI para servir el modelo con transformers. El autor documenta explícitamente el uso con Ollama y con la librería Python `ollama`.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamaño del modelo (0,6 mil millones de parámetros) y la respuesta directa sin razonamiento, se espera una latencia de decenas de milisegundos por factura en GPU y de pocos cientos de milisegundos en CPU, aunque estas estimaciones no están confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B · extractor de facturas (este modelo) | 0,6 B | no disponible | Extraccion de facturas a JSON en espanol | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| Qwen3-0.6B (base) | 0,6 B | no disponible en la informacion | Generacion de texto general y razonamiento | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en la informacion | Instrucciones generales, multilingue | Apache 2.0 | HuggingFace |

La comparación directa con modelos especializados en extracción documental (por ejemplo, Donut, LayoutLM o modelos de document AI comerciales) no está disponible en la información proporcionada. Frente al Qwen3-0.6B base, la ventaja de este ajuste es la salida JSON fiable y el formato fijo sin necesidad de prompting elaborado; su desventaja es la pérdida de generalidad y el sobreajuste a formatos sintéticos.

## Limitaciones y advertencias

- Entrenado únicamente con 200 facturas sintéticas de 12 proveedores ficticios: la precisión con facturas reales, formatos heterogéneos, sellos, tablas complejas o layouts no vistos será previsiblemente inferior al 88 % reportado.
- Requiere entrada en texto: no procesa imágenes ni PDF escaneados directamente; es imprescindible un OCR previo cuya calidad condiciona el resultado.
- Riesgo de alucinación en campos numéricos: al ser un modelo pequeño, puede inventar NIF, importes o fechas cuando el texto de entrada es ambiguo o está incompleto. Se recomienda validación automática de coherencia (base + IVA = total) y revisión humana en importes altos.
- Idiomas: solo español; no se ha entrenado ni evaluado para facturas en otras lenguas o con terminología fiscal de otros países.
- Modo thinking: si no se desactiva (`--think=false` en Ollama o `think=False` en Python), Qwen3 activa su cadena de razonamiento, lo que aumenta la latencia y puede degradar la salida JSON.
- Sin datos de sesgos: no se ha publicado ningún análisis de sesgos, y el conjunto sintético no representa la diversidad de proveedores, sectores ni formatos reales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se publica con 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Fecha de creación atípica (2026-11-02) en los metadatos de HuggingFace, lo que conviene verificar antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas
- Version GGUF para Ollama: https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de Ollama: https://ollama.com
