# bnbong/wegis-model

## Resumen

El modelo `bnbong/wegis-model` es un clasificador binario multimodal diseñado para la detección de sitios de phishing. Desarrollado por el autor bnbong como parte del proyecto Wegis, una extensión de navegador Chrome que analiza en tiempo real todos los enlaces de las páginas web que visita el usuario, este modelo combina dos ramas de procesamiento: una basada en redes neuronales convolucionales (CNN) para el análisis de la URL y otra basada en el transformer MobileBERT para el análisis del contenido HTML de la página. El resultado es una puntuación de probabilidad de que un sitio sea malicioso.

Con aproximadamente 25,6 millones de parámetros, el modelo es ligero y adecuado para su integración en entornos de producción con recursos limitados. Se distribuye bajo licencia Apache-2.0 y soporta los idiomas inglés y coreano. Su relevancia actual radica en la creciente amenaza del phishing y la necesidad de soluciones de detección en tiempo real que puedan ejecutarse en el lado del cliente o en servidores de análisis. No se ha publicado información sobre la longitud de contexto ni sobre cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: CNN (URL) + MobileBERT (HTML) con cabeza de clasificación |
| Parametros totales | 25.645.057 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, .pt (checkpoint) |

## Arquitectura y entrenamiento

El modelo presenta una arquitectura multimodal de dos ramas. La rama de URL procesa la dirección web mediante un embedding a nivel de carácter (vocabulario de 98 caracteres, dimensión 128) seguido de dos convoluciones 1D paralelas con kernels de tamaño 3 y 5, cada una con 256 filtros, y una proyección final a 512 dimensiones. La rama de HTML utiliza el modelo MobileBERT (`google/mobilebert-uncased`) fine-tuneado para extraer características semánticas del texto del cuerpo de la página. Ambas representaciones se concatenan (1024 dimensiones) y pasan por una capa fully connected de 512 unidades con activación GeLU, finalizando en una salida única con sigmoide que indica la probabilidad de phishing.

El entrenamiento se realizó sobre el modelo base MobileBERT, también bajo licencia Apache-2.0. No se han proporcionado detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El código de entrenamiento está disponible en el repositorio `capstone-qshing-ml-jck` de GitHub. La innovación principal reside en la combinación de señales de URL y contenido HTML para mejorar la precisión en la detección de sitios maliciosos.

## Capacidades

- Detección de phishing mediante clasificación binaria (probabilidad de que un sitio sea malicioso).
- Análisis multimodal de URL y contenido HTML de la página.
- Procesamiento de texto en inglés y coreano.
- Integración con el servidor Wegis para análisis en tiempo real de enlaces.
- Compatible con el ecosistema de extensiones de navegador (Chrome) a través de la API del servidor.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es un modelo especializado en clasificación.

## Casos de uso

- Extensión de navegador para bloqueo de phishing: el modelo se integra en la extensión Wegis, que analiza automáticamente todos los enlaces de las páginas visitadas y muestra advertencias antes de que el usuario acceda a sitios peligrosos. Su baja latencia y tamaño reducido permiten ejecutarlo en el servidor de la extensión.
- Servidor de análisis en tiempo real: el repositorio `Wegis_server` implementa una API que recibe URLs y devuelve la probabilidad de phishing. Es adecuado para servicios que necesitan verificar enlaces bajo demanda, como plataformas de mensajería o redes sociales.
- Filtrado de correos electrónicos: puede integrarse en sistemas de seguridad de correo para analizar enlaces contenidos en mensajes y marcar aquellos que apunten a sitios de phishing, reduciendo el riesgo de ataques dirigidos.
- Protección de descargas de archivos: la extensión Wegis presta especial atención a enlaces de descarga (PDF, etc.) y puede usar el modelo para verificar la legitimidad del origen antes de permitir la descarga.
- Monitorización de enlaces en redes sociales: empresas de ciberseguridad pueden desplegar el modelo para escanear URLs compartidas en plataformas sociales y detectar campañas de phishing emergentes.
- Integración en sistemas de seguridad empresarial: como modelo ligero, puede ejecutarse en servidores proxy o firewalls para filtrar tráfico web, complementando otras soluciones de seguridad con una capa específica de detección de phishing.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card:

| Metrica | Valor |
|---|---|
| F1 | 0.8739 |
| Accuracy | 0.8710 |

No se han publicado comparaciones con otros modelos de detección de phishing en la información disponible.

## Requisitos de hardware

- El modelo tiene 25,6 millones de parámetros y un peso de aproximadamente 103 MB en formato safetensors, lo que lo hace muy ligero.
- Puede ejecutarse en CPU sin problemas; una GPU con 1-2 GB de VRAM es más que suficiente para inferencia en tiempo real.
- Es adecuado para despliegue en servidores de baja capacidad, como instancias cloud pequeñas o incluso dispositivos edge.
- No se dispone de datos de latencia o throughput específicos, pero dado el tamaño, se espera una inferencia en el orden de milisegundos en hardware moderno.
- Opciones de despliegue: servidor Python con FastAPI o Flask, integración en la extensión de navegador a través de la API, o exportación a ONNX para entornos optimizados (aunque no se menciona oficialmente).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar benchmarks públicos de detección de phishing para establecer comparaciones.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para detectar phishing y no es un modelo de lenguaje general; no debe usarse para otras tareas de clasificación de texto.
- Solo soporta inglés y coreano; su rendimiento en otros idiomas no está garantizado.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos limitados, puede presentar falsos positivos o negativos en ciertos dominios.
- La arquitectura depende de la clase `QshingModel` definida en el repositorio de entrenamiento; para usarlo correctamente es necesario replicar esa definición, lo que puede requerir adaptación.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de las condiciones de atribución.
- No se proporcionan detalles sobre el conjunto de datos de entrenamiento, lo que dificulta evaluar su robustez frente a variaciones en las técnicas de phishing.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bnbong/wegis-model
- Repositorio de la extensión Wegis: https://github.com/bnbong/Wegis
- Repositorio del servidor Wegis: https://github.com/bnbong/Wegis_server
- Repositorio de entrenamiento: https://github.com/capston-qrcode/capstone-qshing-ml-jck
