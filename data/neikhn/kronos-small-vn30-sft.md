# neikhn/kronos-small-vn30-sft

## Resumen

Kronos-small-vn30-sft es un ajuste fino (SFT) del modelo base NeoQuasar/Kronos-small, un modelo de series temporales orientado a la previsión de precios financieros. Lo publica el usuario neikhn en HuggingFace y está entrenado sobre una instantánea fija del índice VN30 de la bolsa de Vietnam (proveedor VNDIRECT). El modelo conserva la arquitectura propietaria de Kronos y se distribuye con licencia MIT, manteniendo la atribución original.

El problema que aborda es la previsión multi-horizonte de velas OHLC (apertura, máximo, mínimo, cierre) sobre activos del VN30, con un protocolo de inferencia concreto: 128 sesiones históricas como entrada y 20 sesiones futuras como salida, en FP32, con media de 3 trayectorias, temperatura 1.0 y top-p 0.9. El autor lo etiqueta explícitamente como investigación exploratoria: no reclama superioridad frente a un baseline Naive ni rendimiento desplegable en trading real, y advierte de que la construcción de OHLC del proveedor no está plenamente verificada.

Con 24,7 millones de parámetros y un repositorio de 0,1 GB, es un modelo pequeño pensado para ejecución local. La relevancia actual es acotada: se trata de un artefacto de investigación reproducible (incluye hashes de procedencia y especificación de inferencia) más que de un modelo listo para producción. Su interés principal es metodológico, como ejemplo de ajuste fino de Kronos sobre un mercado concreto con trazabilidad de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kronos (arquitectura propietaria del modelo base NeoQuasar/Kronos-small; no se detalla en la información disponible) |
| Parametros totales | 24.741.696 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (protocolo de inferencia: 128 sesiones históricas de entrada, 20 de salida) |
| Tipos de cuantizacion | no disponible (el protocolo de referencia usa FP32) |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | MIT, con atribución a Kronos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de NeoQuasar/Kronos-small y se ajusta mediante SFT sobre una instantánea fija del VN30 de VNDIRECT, con tokenizador congelado durante el ajuste (NeoQuasar/Kronos-Tokenizer-base, revisión 0e0117387f39004a9016484a186a908917e22426). La implementación de Kronos debe fijarse a la revisión 67b630e67f6a18c9e9be918d9b4337c960db1e9a y cargarse con `Kronos.from_pretrained(local_model_directory)`; la arquitectura personalizada no ofrece API de inferencia alojada de forma automática.

El entrenamiento se seleccionó mediante validación nativa incluyendo la época cero, quedándose con la época 5 y semilla 42. El protocolo usa 128 sesiones históricas y 20 futuras, FP32, media de 3 trayectorias, temperatura 1.0 y top-p 0.9. El adaptador rellena con ceros los campos de volumen e importe ausentes. Se incluye la instantánea con SHA256 `fee0bd8c240a9d2be4ef5c9d287eede6c5506b0358c25545e72de99709da4fd2`, junto con `provenance.json` e `inference_spec.json` para revisiones y hashes de bytes. No se incluyen dataset crudo, optimizador, estados del RNG ni credenciales. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de la instantánea VN30.

## Capacidades

- Previsión de series temporales financieras multi-horizonte: genera 20 sesiones futuras a partir de 128 históricas.
- Modelado de velas OHLC sobre activos del índice VN30.
- Inferencia estocástica por muestreo: media de 3 trayectorias con temperatura 1.0 y top-p 0.9.
- Ejecución local mediante la implementación fijada de Kronos, sin dependencia de API alojada.
- Integración con un panel local React/FastAPI incluido en el proyecto del autor.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Investigación reproducible en previsión financiera: el modelo permite replicar experimentos sobre el VN30 con hashes de procedencia y especificación de inferencia fijados, lo que facilita la auditoría metodológica.
- Evaluación de baselines: sirve para comparar el ajuste fino de Kronos frente a Naive y otros métodos sobre el mismo protocolo de 128/20 sesiones, aunque el autor no reclama superioridad.
- Prototipado de paneles de análisis local: el dashboard React/FastAPI incluido permite visualizar trayectorias previstas sin infraestructura en la nube.
- Estudio de ajuste fino sobre mercados emergentes: el caso VN30 ilustra cómo adaptar un modelo de series temporales a un índice concreto con datos de un proveedor específico.
- Docencia y formación: su tamaño reducido (24,7 M de parámetros, 0,1 GB) permite ejecutarlo en portátiles y usarlo en ejercicios de previsión con datos reales.
- Validación de pipelines de datos: el relleno con ceros de volumen e importe ausentes y la congelación del tokenizador sirven como referencia para probar adaptadores de datos financieros.
- Análisis de sensibilidad al muestreo: con temperatura 1.0 y top-p 0.9 sobre 3 trayectorias, permite estudiar la dispersión de las previsiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no reclama superioridad frente a Naive ni rendimiento desplegable en trading.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 24,7 M de parámetros en FP32 el peso ronda los 100 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las gamas actuales; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la implementación fijada de Kronos (`Kronos.from_pretrained`) y el panel local React/FastAPI del proyecto; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neikhn/kronos-small-vn30-sft | 24,7 M | 128 sesiones de entrada / 20 de salida | Previsión OHLC VN30 | MIT | HuggingFace, 0 descargas |
| NeoQuasar/Kronos-small | no disponible | no disponible | Previsión de series temporales (base) | no disponible en la información | HuggingFace (modelo base) |
| Naive (baseline) | no aplica | no aplica | Persistencia del último valor | no aplica | Referencia metodológica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación exploratoria: el autor no reclama superioridad frente a Naive ni rendimiento desplegable en trading.
- La construcción de OHLC del proveedor (VNDIRECT) no está plenamente verificada.
- Los campos de volumen e importe ausentes se rellenan con ceros, lo que puede introducir sesgo en las previsiones.
- Dependencia estricta de revisiones concretas de Kronos y del tokenizador; usar otras versiones puede romper la reproducibilidad.
- No ofrece API de inferencia alojada; requiere ejecución local con la implementación fijada.
- El modelo está ajustado a una instantánea fija del VN30, por lo que su generalización a otros índices o periodos no está validada.
- Riesgo de sobreajuste al periodo histórico de la instantánea; la selección de época (5) se hizo con validación nativa incluyendo época cero, sin datos de test externos reportados.
- No se documentan sesgos conocidos más allá de los derivados de los datos de mercado vietnamita.
- Licencia MIT permite uso comercial, pero se debe conservar la atribución original de Kronos.
- No incluye dataset crudo, optimizador ni estados del RNG, lo que limita la reproducción completa del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neikhn/kronos-small-vn30-sft
- Modelo base: https://huggingface.co/NeoQuasar/Kronos-small
- Tokenizador: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
- Repositorio de Kronos (implementación fijada a la revisión 67b630e67f6a18c9e9be918d9b4337c960db1e9a): no disponible como URL directa en la información proporcionada
- Documentos de procedencia e inferencia: `provenance.json` e `inference_spec.json` dentro del repositorio del modelo
