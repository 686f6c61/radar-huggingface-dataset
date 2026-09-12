# ItsnotAilabs/Sovereign-EIP4907-Entitlement-v1

## Resumen

Sovereign-EIP4907-Entitlement-v1 es un modelo neuronal de pequeño tamaño (4,5 millones de parámetros) desarrollado por ItsnotAilabs y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje: se trata de un extractor de características tabular cuyo cometido es transformar un vector fijo de 16 dimensiones de telemetría de usuario y variables macroeconómicas en cinco salidas simultáneas relacionadas con monetización: precio óptimo en dólares, duración de arrendamiento de una licencia EIP-4907 en segundos, identificador de plantilla de paywall, porcentaje de excedente del comprador y nivel de acción de retención.

El problema que aborda es el de la fijación dinámica de precios y la gestión de derechos de acceso en aplicaciones de suscripción. En lugar de recurrir a precios estáticos de tienda de aplicaciones, el modelo incorpora índices de paridad de poder adquisitivo (PPP), elasticidad de la demanda, riesgo de churn y señales de liquidez para recomendar un precio dentro del rango declarado de 4,99 a 499,00 USD, junto con una duración de licencia que expira de forma natural sin necesidad de transacciones on-chain de revocación.

Es relevante en el nicho concreto de la ingeniería de monetización para aplicaciones móviles y servicios con licencias on-chain (los tags del repositorio mencionan RevenueCat, StoreKit2 y EIP-4907), donde el coste de cómputo y de gas es un factor determinante. Su huella es mínima y está pensado para ejecutarse en CPU con latencias declaradas de 0,24 ms por forward pass, lo que lo sitúa en la categoría de modelos de decisión embebidos más que en la de modelos generativos. La adopción pública es todavía muy reducida: 24 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP profundo (perceptrón multicapa) con activación SiLU y BatchNorm; encoder de 256 dimensiones ocultas y 5 cabezas de salida |
| Parametros totales | 4,5 millones (dato declarado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no procesa secuencias; consume un vector fijo de 16 dimensiones |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados) |
| Idiomas soportados | Inglés (en), según los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; el repositorio está etiquetado como PyTorch y su tamaño es de 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es una red feed-forward pura, sin mecanismos de atención ni recurrencia. La entrada es un tensor de forma [B, 16] que combina telemetría de usuario y variables económicas: velocidad de sesión, consumo de funcionalidades, índice PPP, antigüedad de la cuenta, ARPU, riesgo de churn, decaimiento de prueba, plataforma de tienda, índice de liquidez, tasa de rendimiento, previsión de LTV, velocidad de derechos, diferencial de arbitraje, elasticidad de descuento, sensibilidad a slippage y nivel de riesgo. Ese vector atraviesa un encoder MLP profundo con activación SiLU y normalización por lotes (BatchNorm) de 256 dimensiones ocultas, del que parten cinco cabezas especializadas: regresión de precio óptimo (rango declarado 4,99-499,00 USD), regresión de duración de arrendamiento en segundos para EIP-4907, clasificación de plantilla de paywall en cuatro categorías (High-Growth, Churn-Shield, Enterprise VIP y Micro-Rebate Modal), regresión del porcentaje de excedente del comprador y clasificación del nivel de acción de retención.

No se especifica en la información disponible el volumen de datos de entrenamiento, la composición del dataset, el procedimiento de validación ni si se aplicaron técnicas de ajuste como RLHF o DPO; en un modelo de regresión tabular como este, esas técnicas no resultan de aplicación directa. La innovación que el autor destaca no es arquitectónica sino de diseño de producto: sustituir las revocaciones de licencias on-chain con coste de gas por límites de expiración temporal gestionados mediante EIP-4907, de modo que la licencia decae sola con un coste declarado de 0,00 USD en gas. Tampoco se documentan técnicas de decodificación especulativa ni atención lineal, que no tienen sentido en esta topología.

## Capacidades

- Regresión de precio óptimo: devuelve un valor monetario continuo en dólares dentro del rango declarado de 4,99 a 499,00 USD a partir del vector económico de 16 dimensiones.
- Predicción de duración de arrendamiento: calcula el número de segundos de vigencia óptima de una licencia compatible con el estándar EIP-4907, en función de la antigüedad de la cuenta y el nivel de riesgo.
- Clasificación de plantilla de paywall: asigna la señal de entrada a una de cuatro plantillas AST (High-Growth, Churn-Shield, Enterprise VIP, Micro-Rebate Modal).
- Estimación de excedente del comprador: emite un porcentaje que, según el autor, cuantifica el ahorro garantizado para el cliente.
- Clasificación de acción de retención: propone una acción de retención (rebaja dinámica, extensión de prueba, mejora VIP) a partir de señales de churn y liquidez.
- Inferencia de baja latencia en CPU: 0,24 ms por forward pass según la medición declarada por el autor.
- No dispone de generación de texto, razonamiento, código ni matemáticas simbólicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: los metadatos solo declaran inglés.
- No dispone de modo thinking, visión, audio ni entrada multimodal.

## Casos de uso

- Ajuste dinámico de precios por paridad de poder adquisitivo: la aplicación envía el índice PPP del mercado, la elasticidad de descuento y el ARPU del usuario al vector de entrada, y el modelo devuelve un precio recomendado. Es adecuado porque el precio es una de las cinco salidas nativas y el rango declarado cubre desde microtransacciones hasta licencias empresariales.
- Gestión de licencias on-chain sin coste de gas: en lugar de emitir una transacción de revocación o burn al caducar un derecho de acceso, el sistema usa la duración de arrendamiento predicha para fijar una expiración temporal conforme a EIP-4907. El modelo es apropiado porque su segunda cabeza de salida está entrenada específicamente para ese parámetro.
- Retención proactiva de suscriptores: el modelo consume riesgo de churn, decaimiento de prueba y señales de liquidez, y emite un nivel de acción de retención que el backend puede traducir en una rebaja, una extensión de prueba o una mejora de plan. Encaja en pipelines de CRM que necesitan una decisión por usuario con latencia inferior al milisegundo.
- Selección automática de paywall: la cabeza de clasificación de plantilla permite que el servidor sirva una de las cuatro variantes AST según el perfil del usuario, en lugar de mostrar un diseño único a toda la base de usuarios.
- Motor de decisión en el backend de suscripciones: con 4,5 millones de parámetros y un forward pass declarado de 0,24 ms en CPU, el modelo puede evaluarse por petición en el mismo proceso que sirve la API de compras, sin necesidad de GPU ni de un servicio de inferencia separado.
- Integración con pasarelas de pago móvil (RevenueCat, StoreKit2): el precio y la duración de derecho generados por el modelo pueden inyectarse en el flujo de compra antes de crear el producto o la oferta promocional.
- Simulación de escenarios de precios y LTV: al ser un modelo determinista y barato de ejecutar, permite barrer combinaciones de las 16 variables de entrada para estimar el impacto sobre precio, excedente y retención antes de desplegar un cambio real.
- Segmentación por nivel de riesgo y detección de arbitraje: los campos de nivel de riesgo, diferencial de arbitraje y sensibilidad a slippage permiten clasificar cuentas potencialmente abusivas o explotadoras de diferencias de precio entre regiones.

## Benchmarks y rendimiento

El campo `model-index` de la model card declara el modelo con una lista de resultados vacía, por lo que no existen benchmarks verificables publicados con conjunto de evaluación, protocolo o comparación frente a terceros.

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas cifras existentes son métricas de validación declaradas por el propio autor, sin que se especifiquen el conjunto de datos, el tamaño de la muestra ni el procedimiento de medición:

| Metrica (declarada por el autor) | Valor declarado | Objetivo declarado |
|---|---|---|
| MSE de validación de precios | 0,0018 | < 0,0100 |
| MAE de precios | 0,12 USD | < 0,50 USD |
| R² de precios | 0,9984 (99,84 %) | > 0,9900 |
| Precisión de ahorro de excedente del comprador | 99,65 % | > 98,50 % |
| Latencia de forward pass | 0,24 ms (CPU) | < 1,0 ms |
| Número de parámetros | 4,5 millones | Escala ligera |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión. En FP32, 4,5 millones de parámetros ocupan aproximadamente 18 MB de pesos; en FP16, unos 9 MB. El cuello de botella es el tamaño de lote, no el modelo.
- GPU recomendadas: ninguna en particular. Cualquier GPU con soporte CUDA sirve, incluidas tarjetas de gama de entrada. El modelo está diseñado explícitamente para ejecutarse en CPU.
- Cabe en GPU de consumo: sí, con enorme margen, en cualquier tarjeta consumer actual e incluso en modelos integrados de portátil y en dispositivos móviles mediante exportación.
- Opciones de despliegue: al ser una red MLP de PyTorch, las vías naturales son TorchScript, exportación a ONNX Runtime, o incrustación directa en un servicio Python. No procede usar vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje autorregresivos y no aplican a esta topología.
- Latencia y throughput: el autor declara 0,24 ms por forward pass en CPU. No se declara throughput agregado, pero con esa latencia la inferencia en CPU es compatible con servicios de decisión por petición.

## Comparativa con modelos similares

No se dispone de información sobre modelos publicados directamente comparables que cubran exactamente la misma combinación de tareas (precio óptimo, duración de licencia EIP-4907, plantilla de paywall, excedente del comprador y nivel de retención). La comparación siguiente es cualitativa y se limita a alternativas genéricas empleadas en la industria para problemas de decisión tabular en monetización; los campos no documentados se marcan como no disponibles.

| Alternativa | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sovereign-EIP4907-Entitlement-v1 | MLP multitarea (regresión + clasificación) | 4,5 M | No aplica (vector de 16 dimensiones) | Métricas declaradas por el autor, sin benchmark verificable | Apache 2.0 | HuggingFace, 24 descargas |
| Modelos de gradient boosting para pricing (familia XGBoost / LightGBM) | Árboles potenciados | No disponible | No aplica (vector tabular) | No disponible | Apache 2.0 / MIT según implementación | Amplia, estándar en la industria |
| Modelos de predicción de churn basados en regresión logística o GBM | Clasificación tabular | No disponible | No aplica | No disponible | Variable según implementación | Amplia |
| Modelos de forecasting de demanda (por ejemplo, familia DeepAR) | Red recurrente / autorregresiva sobre series temporales | No disponible | No aplica (series temporales) | No disponible | Variable | Frameworks públicos de forecasting |

## Limitaciones y advertencias

- Las métricas de rendimiento proceden exclusivamente del autor. El campo `model-index` está vacío, no se identifica el conjunto de datos de evaluación y no existe validación independiente, por lo que los valores de R² de 0,9984 o de precisión de excedente del 99,65 % no deben tomarse como garantía en producción.
- El repositorio tiene un tamaño declarado de 0,0 GB. Antes de integrarlo conviene verificar que los pesos están realmente publicados y son cargables, ya que el ejemplo de uso importa un módulo (`sovereign_eip4907_entitlement_v1_model`) que no se documenta como parte del repositorio.
- Riesgo de alucinación en sentido funcional: la salida de precio óptimo y de excedente garantizado puede ser errónea sin que el modelo exprese incertidumbre, al no exponer intervalos de confianza ni scores de calibración.
- Sesgo potencial relevante: el uso de índices PPP, elasticidad de descuento y señales de liquidez puede trasladar desigualdades económicas regionales a los precios ofrecidos, con implicaciones de equidad y de cumplimiento normativo.
- Precios dinámicos y personalizados pueden entrar en conflicto con normativa de protección al consumidor y con el RGPD si las 16 variables de entrada permiten identificar a personas concretas. El modelo no incorpora mecanismos de anonimización.
- Rango de validez limitado: el autor declara el rango de precio 4,99-499,00 USD. Fuera de ese intervalo el comportamiento no está documentado y la extrapolación no es fiable.
- El modelo no procesa lenguaje natural: no genera texto, no mantiene conversaciones, no ejecuta código y no soporta tool calling ni agentes. Cualquier uso como asistente conversacional es un error de categoría.
- Los metadatos solo declaran inglés. No se documenta comportamiento en otros idiomas ni sensibilidad a la localización.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se ofrece sin garantías; el nombre "Sovereign" no implica certificación, auditoría ni respaldo de ninguna entidad.
- Adopción mínima: 24 descargas y 1 like. No existe comunidad, issues públicos documentados ni historial de mantenimiento más allá de dos actualizaciones en septiembre de 2026.
- Ausencia de documentación sobre cuantización, formato de pesos y proceso de exportación, lo que obliga a validar manualmente el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsnotAilabs/Sovereign-EIP4907-Entitlement-v1
- Repositorio del autor: https://huggingface.co/ItsnotAilabs
- Búsqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repositorios o demos). Los resultados devueltos por el buscador corresponden a páginas genéricas de YouTube (https://www.youtube.com/, https://www.youtube.com/shorts, https://www.youtube.com/feed/homepage) y no guardan relación con el modelo.
