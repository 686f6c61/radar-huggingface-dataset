# eoinedge/rail-fusion

## Resumen

eoinedge/rail-fusion es un modelo de fusión de sensores orientado a la detección de causa raíz (root-cause) dentro del paquete denominado "busfusion", en el ámbito ferroviario ("rail"). No se trata de un modelo de lenguaje generativo, sino de un modelo de inferencia embebida empaquetado como `model.pte`, el formato de programa serializado de ExecuTorch, con backend XNNPACK. El autor es el usuario de HuggingFace "eoinedge" y el repositorio se publicó el 9 de octubre de 2026.

El bundle incluye, además de los pesos, los ficheros `labels.txt`, `input_shape.txt`, `features.json` y `metrics.json`, lo que indica que el modelo opera sobre un vector de características de sensores con un número fijo de entradas y produce una clasificación entre un conjunto cerrado de etiquetas. Está pensado para ejecutarse en dos entornos concretos: una variante de aplicación Android llamada `obd-sam3-fusion` y un bucle Linux llamado `busfusion`. Es, por tanto, un modelo de borde (edge) para diagnóstico, no un modelo de propósito general.

La relevancia de este tipo de modelos radica en su papel como componentes de diagnóstico industrial: fusionar señales heterogéneas de bus y sensores para atribuir una avería a una causa concreta. Sin embargo, la información pública disponible es extremadamente escasa: no hay pipeline declarado, ni licencia, ni idiomas, ni parámetros, ni arquitectura documentada en la model card, y las descargas y "likes" son cero en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada; se distribuye como programa ExecuTorch/XNNPACK) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de fusión de sensores, no de lenguaje) |
| Tipos de cuantización | no disponible (formato de despliegue `model.pte`; la cuantización concreta no se especifica) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ExecuTorch `.pte` (bundle con `labels.txt`, `input_shape.txt`, `features.json`, `metrics.json`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo único verificable es el formato de distribución: un programa ExecuTorch (`model.pte`) con backend XNNPACK, lo que implica un grafo compilado para ejecución en CPU de borde, típicamente ARM en Android y x86/ARM en Linux. Por las etiquetas declaradas (`sensor-fusion`, `rail`, `root-cause`) y por los ficheros adjuntos, cabe inferir que se trata de un modelo de clasificación sobre un vector de características de entrada de forma fija, pero no hay confirmación del tipo de red (MLP, CNN 1D, modelo temporal o similar).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el régimen de etiquetado ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco plausibles en este tipo de modelo). El fichero `metrics.json` incluido en el bundle sugiere que el autor registró métricas de evaluación, pero su contenido no se ha publicado en la información disponible. No se documenta ninguna innovación técnica destacable.

## Capacidades

- Fusión de señales de sensores para un dominio ferroviario y de bus de datos ("busfusion"), según los tags del repositorio.
- Diagnóstico de causa raíz: clasificación de una condición o avería en una etiqueta de salida, a partir del fichero `labels.txt` del bundle.
- Inferencia en dispositivo (on-device) mediante el runtime de ExecuTorch, sin dependencia de servidores externos.
- Integración en dos entornos concretos: la variante Android `obd-sam3-fusion` y el bucle Linux `busfusion`.
- Entrada de forma fija: el fichero `input_shape.txt` define el tensor esperado, lo que implica que el modelo no acepta entradas de longitud variable.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento (thinking).

## Casos de uso

- Diagnóstico de causa raíz en material rodante: el modelo recibiría una ventana de lecturas fusionadas de sensores y devolvería la etiqueta de causa más probable, ayudando al personal de mantenimiento a priorizar la intervención.
- Mantenimiento predictivo embebido en el vehículo: al ejecutarse con ExecuTorch sobre CPU de borde, puede correr directamente en la unidad de a bordo sin enviar telemetría a la nube, reduciendo latencia y exposición de datos.
- Aplicación Android de campo: integrado en la variante `obd-sam3-fusion`, permitiría a un técnico con un dispositivo Android obtener un diagnóstico local a partir de los datos del bus del vehículo.
- Procesado por lotes en pasarela Linux: el bucle `busfusion` podría ejecutar el modelo sobre registros históricos de sensores para clasificar episodios y generar informes de incidencias.
- Enrutado de alertas: usar la etiqueta de causa raíz como disparador para escalar únicamente los eventos relevantes, filtrando ruido de sensores en el sistema de monitorización.
- Componente de un pipeline mayor de analítica ferroviaria: al ser un `.pte` autocontenido con etiquetas y forma de entrada declaradas, puede insertarse como etapa de clasificación dentro de sistemas de gestión de flotas ya existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El bundle incluye un fichero `metrics.json`, lo que indica que el autor dispone de métricas de evaluación, pero sus valores no se han hecho públicos en la información consultada. No se deben asumir cifras de precisión, recall o F1 sin acceso a ese fichero.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo ExecuTorch/XNNPACK, el objetivo declarado es la ejecución en CPU de borde, presumiblemente sin GPU dedicada.
- GPU recomendadas: no disponible. El backend XNNPACK apunta a CPU; no hay indicios de uso de CUDA, ROCm ni aceleradores de servidor.
- Compatibilidad con GPU de consumo: no disponible; el diseño parece orientado a ejecución en CPU móvil o de pasarela, no a GPU de consumo.
- Opciones de despliegue: runtime de ExecuTorch con backend XNNPACK. El formato `.pte` no es directamente compatible con vLLM, llama.cpp ni Ollama, que están orientados a modelos de lenguaje. Los entornos previstos son la aplicación Android `obd-sam3-fusion` y el bucle Linux `busfusion`.
- Latencia y throughput: no disponibles. Dependerán del tamaño real del grafo y del hardware de destino, datos que no se han publicado.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de fusión de sensores ferroviarios publicados en HuggingFace, ni alternativas de la misma categoría con las que contrastar parámetros, contexto, rendimiento o licencia. Tampoco se dispone del número de parámetros del propio modelo, lo que impide cualquier comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentación sobre la distribución del dataset de entrenamiento ni sobre posibles sesgos de dominio.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea o de confianza indebida en la etiqueta de causa raíz si el modelo se aplica fuera de la distribución de sensores con la que fue entrenado.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje, por lo que las capacidades multilingües no aplican. La entrada está restringida a una forma fija definida en `input_shape.txt`.
- Restricciones de licencia: la licencia no está declarada en el repositorio. Sin licencia explícita, no puede asumirse permiso para uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Caveat de producción: el repositorio registra cero descargas y cero "likes", sin pipeline declarado ni documentación de arquitectura, datos o métricas. Se trata de un artefacto sin validación comunitaria ni trazabilidad pública, por lo que no es recomendable para producción sin una evaluación propia y exhaustiva.
- Ausencia de métricas públicas: al no publicarse el contenido de `metrics.json`, no es posible verificar el rendimiento real del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eoinedge/rail-fusion
- Documentación de ExecuTorch: no disponible en la información proporcionada (no se incluyen enlaces oficiales en la model card).
- Paper o blog del autor: no disponible.
- Repositorio de código: no disponible.
- Demo: no disponible.
