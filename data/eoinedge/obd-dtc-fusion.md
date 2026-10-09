# eoinedge/obd-dtc-fusion

## Resumen

eoinedge/obd-dtc-fusion es un modelo de fusión de sensores orientado a códigos de avería (DTC, Diagnostic Trouble Codes) que se ejecuta en el propio dispositivo. Lo publica el usuario eoinedge en Hugging Face y su único contexto documentado es su integración en la aplicación Android obd-sam3-fusion, distribuida como bundle junto con los ficheros model.pte, labels.txt, input_shape.txt y features.json. El repositorio no declara pipeline, idiomas, licencia ni resultados de evaluación.

Por el etiquetado (executorch, obd, sensor-fusion) y el formato de pesos .pte, se trata de un artefacto pensado para inferencia local mediante el runtime ExecuTorch en teléfono o dispositivo embebido, no para despliegue en GPU de centro de datos. El problema que aborda es el análisis de señales OBD-II (voltajes, temperaturas, régimen, carga de motor, etc.) para clasificar o anticipar fallos antes de que se dispare un DTC.

Su relevancia actual es limitada: cero descargas y cero likes en el momento de la consulta, y la model card no aporta ni arquitectura, ni tamaño, ni datos de entrenamiento. Es, por tanto, un artefacto de nicho ligado a una aplicación concreta, útil como referencia de despliegue edge más que como modelo evaluable de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de clasificación de sensores; no declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sin licencia declarada en el repositorio) |
| Formato de pesos | ExecuTorch .pte (bundle con labels.txt, input_shape.txt y features.json) |
| Tarea declarada | sensor-fusion para DTC (On-Board Diagnostics) |
| Runtime / libreria | ExecuTorch |
| Aplicacion asociada | obd-sam3-fusion (Android) |
| Region declarada | us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (registro) | 2026-10-08 |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna del modelo: la model card se limita a una línea descriptiva y a la lista de ficheros del bundle. No se especifica si es un transformer, un MLP, un modelo tabular o un ensemble, ni el número de parámetros, capas o cabezas. Tampoco se documentan hiperparámetros, función de pérdida ni estrategia de cuantización, algo relevante porque en ExecuTorch es habitual exportar a int8 para reducir latencia y huella de memoria, pero no hay confirmación de que este artefacto lo haga.

Lo único inferible procede de los nombres de los ficheros del bundle: model.pte es el programa serializado que carga el runtime ExecuTorch; features.json describiría el conjunto y el orden de las señales de entrada; input_shape.txt fijaría la forma del tensor de entrada; y labels.txt contendría las clases de salida (presumiblemente códigos DTC o categorías de fallo). No se indica el volumen de datos de entrenamiento, su procedencia (vehículos reales, simulación, datasets públicos OBD-II), ni si hubo ajuste fino con RLHF/DPO, algo que en un modelo de clasificación de sensores no aplicaría de forma estándar.

## Capacidades

- Clasificación o inferencia de códigos de avería (DTC) a partir de señales OBD-II, según la descripción del autor.
- Fusión de múltiples sensores en una única entrada, de ahí la etiqueta sensor-fusion y el fichero features.json.
- Inferencia en dispositivo mediante ExecuTorch, sin dependencia de conectividad ni de servicios en la nube.
- Salida con etiquetas predefinidas, coherente con la presencia de labels.txt en el bundle.
- Integración prevista con la aplicación Android obd-sam3-fusion.
- No hay evidencia de generación de texto, razonamiento multi-paso, código, matemáticas, visión ni audio.
- No hay evidencia de soporte de tool calling, function calling ni comportamiento de agente.
- No hay información sobre capacidades multilingües ni sobre tratamiento de lenguaje natural.

## Casos de uso

- Diagnóstico a bordo sin conexión en la app obd-sam3-fusion: el modelo se carga como .pte dentro de la aplicación Android y clasifica el estado del vehículo en local, lo que encaja con escenarios de taller o carretera sin cobertura de datos.
- Detección temprana de fallos antes de que se dispare un DTC: la fusión de señales continuas (voltaje, temperatura, régimen) permite señalar anomalías cuando el sistema OBD-II todavía no ha registrado un código, siempre que esa capacidad esté efectivamente implementada.
- Telemetría de flotas con procesamiento en el vehículo: al ejecutarse en dispositivo, los datos crudos del bus no tienen que salir del vehículo, lo que simplifica el cumplimiento de privacidad y reduce coste de ancho de banda frente a enviar toda la telemetría a un backend.
- Asistencia al mecánico en taller: el modelo aporta una categoría de fallo priorizada a partir de las señales registradas, que el técnico usa como pista antes de la inspección física, reduciendo el tiempo de diagnóstico.
- Mantenimiento predictivo en vehículos comerciales: el mismo artefacto puede embeberse en unidades de a bordo para monitorizar vehículos de reparto o flotas industriales y programar intervenciones.
- Seguros basados en uso (UBI) y peritación: la clasificación local de fallos permite asociar patrones de conducción y estado mecánico sin exportar datos personales de telemetría.
- Aplicaciones de consumo tipo escáner OBD-II: integrado en una app móvil, ofrece al usuario una interpretación más rica que la simple lectura del código de error.
- Validación y etiquetado previo de datos OBD-II: el modelo puede usarse como preetiquetador de registros para construir datasets de diagnóstico, a falta de benchmarks que respalden su precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay métricas de accuracy, F1, latencia ni throughput declaradas en la model card, y los resultados de búsqueda no aportan evaluaciones de este artefacto concreto.

## Requisitos de hardware

- VRAM estimada: no disponible. El destino declarado es inferencia en dispositivo, por lo que el recurso relevante es la memoria RAM del teléfono o del equipo embebido, no la VRAM de una GPU.
- GPU recomendadas: no aplica según la información disponible; el formato .pte y la librería ExecuTorch apuntan a CPU, GPU móvil o aceleradores NPU integrados, no a A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar ni descartar sin conocer arquitectura y tamaño de parámetros.
- Opciones de despliegue: ExecuTorch es la única vía documentada, a través del bundle model.pte con sus ficheros auxiliares. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En los resultados de búsqueda aparecen literatura académica sobre aplicaciones de machine learning con OBD-II (revisión de MDPI) y productos comerciales de diagnóstico con IA (OBDAI), pero no se ha identificado ningún modelo abierto comparable publicado con pesos descargables y licencia declarada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eoinedge/obd-dtc-fusion | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin un fichero de licencia, el uso comercial queda en un limbo legal y, por defecto, no puede asumirse permiso de reutilización.
- Documentación mínima: una sola línea de descripción; no hay información sobre arquitectura, entrenamiento, datos ni evaluación, lo que impide auditar el modelo o estimar su precisión.
- Sin validación independiente: cero descargas y cero likes implican que no existe comunidad que haya reproducido o cuestionado sus resultados.
- Riesgo de falsos positivos y falsos negativos: al ser un modelo de clasificación de fallos, el error no se manifiesta como alucinación textual sino como diagnósticos incorrectos, con impacto potencial en seguridad y coste de reparación.
- Sesgos desconocidos: se desconoce la distribución de vehículos, marcas, motores y condiciones climáticas presentes en los datos de entrenamiento, por lo que el comportamiento fuera de ese dominio es impredecible.
- Alcance funcional acotado: no genera texto, no conversa, no soporta tool calling ni agentes; cualquier producto que requiera explicar el diagnóstico necesita otra capa.
- Dependencia del runtime: el uso está atado a ExecuTorch y al contrato de entrada definido en input_shape.txt y features.json; cambiar el orden o la escala de las señales invalida las predicciones.
- Sin datos de cuantización: se desconoce la pérdida de precisión asociada a la exportación a .pte.
- No debe usarse como sustituto de un diagnóstico profesional ni en decisiones con implicación de seguridad sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eoinedge/obd-dtc-fusion
- Perfil del autor en Hugging Face: https://huggingface.co/eoinedge
- Datasets del autor: https://huggingface.co/eoinedge/datasets
- Articulo sobre diagnostico OBD-II con IA: https://growthworks.live/ai-powered-obd-ii-data-driven-diagnostics-2026/
- Revision academica de aplicaciones ML sobre OBD-II (MDPI): https://www.mdpi.com/1424-8220/25/13/4057
- Producto comercial de referencia en diagnostico con IA: https://obdai.app/
