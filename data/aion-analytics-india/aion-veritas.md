# aion-analytics-india/aion-veritas

## Resumen

AION Veritas es una ficha de descubrimiento publicada en Hugging Face por AION Analytics Private Limited (India), una empresa fundada por Lokesh Gupta. A pesar de su presencia en el repositorio, no se trata de un modelo de lenguaje abierto: la model card indica explicitamente que no contiene pesos ni metodologia, y que el modelo es propietario. Su funcion es la publicacion de bandas de probabilidad pre-apertura para los indices bursatiles indios NIFTY 50, BANK NIFTY y SENSEX, con un horizonte prospectivo actual de los primeros 15 minutos de sesion (09:15 a 09:30 IST).

El producto se ofrece como servicio: un trial gratuito de NIFTY 50 durante 7 dias naturales (168 horas) previa verificacion de email y passkey, y acceso de pago para BANK NIFTY, SENSEX y NIFTY en vivo tras el periodo de prueba. El autor insiste en que no es una senal de trading, no es una prediccion de precio puntual y no constituye asesoramiento financiero; AION no esta registrada como Research Analyst ni Investment Adviser ante SEBI.

La relevancia de esta ficha en un contexto de IA open source es limitada: se trata de un caso de uso de "model card como escaparate comercial" sin artefactos tecnicos descargables. No hay informacion publica sobre arquitectura, parametros, datos de entrenamiento ni metodologia, por lo que los apartados tecnicos de esta ficha reflejan mayoritariamente la ausencia de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo propietario, sin metodologia publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | cc-by-4.0 (aplicada a la documentacion; el modelo es propietario) |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card declara explicitamente que "contains no model weights and no methodology - the AION Veritas model is proprietary". No hay datos sobre numero de parametros, tipo de transformer, composicion del dataset, volumen de tokens de entrenamiento ni tecnicas de alineacion (RLHF, DPO u otras).

El unico artefacto de validacion mencionado es un registro publico de resultados (aciertos y fallos) mantenido como dataset rastreable en el panel de AION Analytics, no en Hugging Face. Este registro conserva las ventanas de medicion originales de cada recibo historico, y el autor advierte que el horizonte actual (15 minutos) no reescribe registros pasados ni garantiza cobertura futura.

## Capacidades

- Publicacion de bandas de probabilidad pre-apertura para NIFTY 50, BANK NIFTY y SENSEX, a nivel de indice unicamente (no sectores ni acciones individuales).
- Horizonte prospectivo actual: primeros 15 minutos de sesion (09:15 a 09:30 IST).
- Validacion publica con registro de aciertos y fallos en un panel accesible por web.
- Acceso freemium: trial gratuito de NIFTY 50 durante 168 horas con email verificado y passkey; acceso de pago para el resto de indices y para NIFTY en vivo tras el trial.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de un LLM; no se documentan capacidades de generacion de texto, codigo, matematicas, vision ni audio.
- Capacidades multilingues: no disponibles; los metadatos solo declaran ingles.

## Casos de uso

- Seguimiento de la apertura de indices indios: un operador puede consultar la banda de probabilidad publicada antes de las 09:15 IST para contextualizar el rango esperado de los primeros 15 minutos de NIFTY 50, BANK NIFTY o SENSEX, sin tratarla como senal de entrada o salida.
- Investigacion sobre calibracion de pronosticos: el registro publico de validacion, que incluye fallos, permite a analistas cuantitativos estudiar la calibracion historica de las bandas y compararlas con sus propios modelos.
- Evaluacion de proveedores de senales financieras: un equipo de riesgo puede usar los recibos de validacion publicos para auditar el historial de aciertos y errores antes de contratar el servicio de pago.
- Prototipado de estrategias de rango: dado que el producto entrega un rango y no un punto, encaja en disenos de estrategias basadas en ruptura o rango de apertura, siempre que el usuario aporte su propia logica de decision y gestion de riesgo.
- Docencia y divulgacion sobre finanzas cuantitativas: el caso ilustra el uso de bandas probabilisticas frente a predicciones puntuales y la importancia de publicar los fallos junto a los aciertos.
- Integracion en paneles internos de seguimiento: un equipo puede enlazar el panel de validacion y las bandas publicadas en sus propios dashboards de monitorizacion de indices, respetando los terminos de acceso del proveedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, cobertura, Brier score ni ningun otro indicador cuantitativo; solo remite al registro publico de validacion en el sitio del proveedor, que no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se distribuyen pesos ni artefactos ejecutables).
- GPU recomendadas: no disponible.
- Ejecucion en GPU de consumo: no aplicable; el acceso es via servicio web del proveedor.
- Opciones de despliegue: no aplicable (vLLM, llama.cpp, Ollama o TGI no son relevantes para este producto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AION Veritas | no disponible | no disponible | sin benchmarks publicados; validacion en panel externo | cc-by-4.0 en documentacion; modelo propietario | servicio web con trial y suscripcion |
| Alternativas de pronostico probabilistico de indices | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Las busquedas web devuelven principalmente resultados no relacionados (videojuegos AION de Gameforge y NCSoft) y la propia pagina del producto.

## Limitaciones y advertencias

- Modelo propietario: no hay pesos, metodologia ni codigo de entrenamiento; es imposible reproducir, auditar o desplegar localmente.
- La licencia cc-by-4.0 se aplica a la documentacion del repositorio, no al modelo ni al servicio, cuyo uso se rige por los terminos del sitio del proveedor.
- No es una senal de trading, no es una prediccion de precio puntual y no constituye asesoramiento financiero; AION no esta registrada como Research Analyst ni Investment Adviser ante SEBI.
- Cobertura limitada a indices (NIFTY 50, BANK NIFTY, SENSEX); no cubre sectores ni acciones individuales.
- Horizonte muy corto (15 minutos desde la apertura); los recibos historicos conservan ventanas de medicion distintas y no garantizan cobertura futura.
- Riesgo de sobreinterpretacion por parte del usuario: el autor advierte que el producto es "a guiding light, not a guiding hand".
- El trial gratuito esta limitado a NIFTY 50 durante 168 horas; el resto de indices y el NIFTY en vivo requieren suscripcion de pago.
- El registro de validacion vive fuera de Hugging Face; no hay dataset descargable en el repositorio.
- Advertencia de identidad: AION Analytics Private Limited (India) no esta afiliada a Aion Analytics LLC (Estados Unidos) ni a AION Labs (Israel).
- Riesgo de confusion en busquedas: los terminos "AION" devuelven principalmente resultados de videojuegos, lo que puede dificultar el descubrimiento del producto.

## Enlaces

- Hugging Face: https://huggingface.co/aion-analytics-india/aion-veritas
- Producto, trial y acceso de pago: https://aionanalytics.in/veritas
- Recibos de validacion publicos: https://aionanalytics.in/veritas/validation
- Pagina tecnica del modelo: https://aionanalytics.in/models/veritas
- Repositorio canonico en GitHub: https://github.com/AION-Analytics-India/aion-veritas
- LinkedIn de la empresa: https://www.linkedin.com/company/aion-analytics-india/
