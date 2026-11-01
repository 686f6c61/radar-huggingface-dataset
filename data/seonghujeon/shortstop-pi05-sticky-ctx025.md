# SeonghuJeon/shortstop-pi05-sticky-ctx025

## Resumen

Shortstop π0.5 (sticky pad, context 0.25 s) es un ajuste fino completo del modelo base `pi05_base` de Physical Intelligence, desarrollado por el usuario SeonghuJeon y publicado en HuggingFace. Se trata de una política robótica visomotora (vision-language-action) especializada en una única tarea: capturar un objeto en vuelo con una almohadilla adhesiva y liberarlo en una papelera situada a la izquierda. El modelo deriva de la arquitectura π0.5 de OpenPI y conserva las porciones de pesos heredadas de Gemma, por lo que su licencia es la Gemma Terms of Use.

El ajuste se realizó sin LoRA, con entrenamiento completo sobre 17.772 actualizaciones del optimizador (seis épocas de referencia), 1.911 episodios de entrenamiento y 100 de validación, con un tamaño de lote de 16 y una masa de pérdida actual:futura de 1:1. El repositorio ocupa 5,3 GB e incluye los pesos en formato nativo JAX/Orbax OCDBT exportados a bfloat16 para inferencia, junto con estadísticas de normalización y un fichero `shortstop_policy.json`.

Su relevancia es acotada pero concreta: documenta un experimento reproducible de adaptación de una política VLA a una tarea de manipulación dinámica con historial temporal explícito (cuatro fotogramas de cabeza pasados agrupados en 16 tokens cada uno). No obstante, los resultados registrados son diagnósticos de desarrollo (25 % de captura, 5 % de colocación correcta sobre 40 episodios) y el propio autor advierte que no constituyen una puntuación oficial de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action derivada de π0.5 (OpenPI), con extensión de historial temporal |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 0,25 s de historial (cuatro fotogramas a -200, -150, -100 y -50 ms, 16 tokens por fotograma) |
| Tipos de cuantizacion | bfloat16 (exportación de inferencia); no se documentan otras |
| Idiomas soportados | no disponible (instrucción en inglés) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | JAX/Orbax OCDBT nativo, exportado a bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base` de Physical Intelligence y aplica un ajuste fino completo (sin LoRA) durante 17.772 actualizaciones del optimizador, equivalentes a seis épocas de referencia sobre 1.911 episodios de entrenamiento y 100 de validación, con lote de 16 y muestreo OS10. La pérdida combina masa actual y futura en proporción 1:1. La extensión "history-aware" de OpenPI incorpora cuatro fotogramas de cabeza pasados (-200, -150, -100 y -50 ms), agrupados a 16 tokens por fotograma, además de las tres imágenes de cámara actuales; si falta historial se repite el primer fotograma.

La política opera a 20 Hz: cada llamada ejecuta tres comandos articulares absolutos consecutivos a 60 Hz. El layout de acción es: seis articulaciones izquierdas, comando de herramienta izquierda, seis articulaciones derechas y comando de herramienta derecha. Los objetivos articulares están en radianes y el canal de herramienta sigue la convención de posición del dedo YAM en metros; para las almohadillas adhesivas, valores por debajo de 0,0175 activan la adherencia y un comando abierto la libera. La política no utiliza entrada propioceptiva, aunque el protocolo del adaptador puede seguir requiriendo un campo de estado. Las predicciones contienen 123 comandos, de los cuales solo se ejecutan los tres primeros.

## Capacidades

- Control visomotor para manipulación robótica bimanual con almohadillas adhesivas.
- Captura de objetos en vuelo y liberación en una papelera designada.
- Procesamiento de historial temporal corto (0,25 s) mediante cuatro fotogramas pasados agrupados en tokens.
- Generación de secuencias de acción de 123 comandos a partir de tres imágenes de cámara.
- Ejecución a 20 Hz con subcomandos articulares a 60 Hz.
- Seguimiento de instrucción en lenguaje natural (en inglés) para la tarea específica.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en manipulación dinámica: reproducir el experimento de captura en vuelo con almohadilla adhesiva para estudiar el efecto del historial temporal en políticas VLA.
- Banco de pruebas de políticas VLA: usar el checkpoint como referencia para comparar ajustes finos completos frente a LoRA sobre `pi05_base`.
- Evaluación de infraestructura OpenPI: validar el despliegue del servidor nativo y el puente Shortstop en dos procesos separados sobre A100 80 GB.
- Estudio de pérdida actual:futura: analizar cómo la proporción 1:1 afecta a la estabilidad del entrenamiento en tareas de contacto dinámico.
- Prototipado de agarre adhesivo: probar la convención de comando de herramienta YAM (umbral 0,0175 m) en plataformas bimanuales equivalentes.
- Docencia y divulgación: ilustrar el ciclo completo de un ajuste fino de política robótica, desde el dataset hasta la inferencia verificada con salidas finitas.
- Diagnóstico de robustez temporal: evaluar el comportamiento con historial incompleto, ya que el modelo repite el primer fotograma cuando faltan datos.

## Benchmarks y rendimiento

| Metrica | Resultado | Base |
|---|---:|---|
| Captura | 10 / 40 (25 %) | Panel fijo de desarrollo, 40 episodios |
| Retenido en el checkpoint | 10 / 40 (25 %) | Panel fijo de desarrollo, 40 episodios |
| Colocado y liberado en la papelera correcta | 2 / 40 (5 %) | Panel fijo de desarrollo, 40 episodios |

El autor indica explícitamente que se trata de un diagnóstico de entrenamiento (`training_diagnostic`), sin solapamiento de identificadores de episodio con el entrenamiento y **no** una puntuación oficial de test. Las distribuciones de entrenamiento y evaluación del benchmark son provisionales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la verificación de carga e inferencia se realizó en una A100 80 GB.
- GPU recomendadas: A100 80 GB (verificada). No se documentan otras GPU.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; el formato nativo JAX/Orbax y el runtime experimental sugieren que no es un caso de uso previsto.
- Despliegue: servidor nativo OpenPI (`shortstop.policy.pi05.serve`) en el puerto 18776 y puente Shortstop (`scripts/serve_policy.py`) en el puerto 18777, en dos procesos separados dentro del mismo entorno experimental.
- Latencia y throughput: no disponibles; se conoce la tasa de observación de 20 Hz y la ejecución de tres comandos a 60 Hz por llamada.
- Requisito adicional: adaptador experimental Shortstop y acceso al repositorio `worv-ai/worv` (PR #124). Una instalación estándar de OpenPI no reproduce la inferencia de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shortstop π0.5 sticky-ctx025 | no disponible | 0,25 s de historial | Captura en vuelo con almohadilla adhesiva | Gemma Terms of Use | HuggingFace, 0 descargas |
| `pi05_base` (Physical Intelligence) | no disponible | no disponible | Política VLA generalista | no disponible en la información | GitHub OpenPI |
| Otros ajustes de π0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Resultados de rollout muy bajos: 25 % de captura y 5 % de colocación correcta, sobre un panel diagnóstico de 40 episodios sin solapamiento con entrenamiento.
- El autor califica el benchmark como provisional y los checkpoints como exportaciones experimentales, no como una release oficial.
- Requiere el adaptador experimental Shortstop y acceso al repositorio privado `worv-ai/worv` (PR #124); una instalación estándar de OpenPI no basta.
- La verificación de inferencia se limitó a dos llamadas con entradas RGB sintéticas; no se valida la tasa de éxito de rollout, la integración websocket ni la instalación desde un checkout limpio.
- No se incluyen dataset, estado del optimizador, credenciales ni código de implementación privado.
- Licencia Gemma Terms of Use: las porciones derivadas de Gemma quedan sujetas a sus restricciones de uso, incluido el uso comercial.
- La política no usa entrada propioceptiva; el protocolo del adaptador puede exigir igualmente un campo de estado.
- Solo se ejecutan los tres primeros de los 123 comandos predichos; el resto se descarta.
- El historial faltante se sustituye repitiendo el primer fotograma, lo que puede degradar el rendimiento en arranques en frío.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Idiomas: solo se documenta una instrucción en inglés; no hay soporte multilingüe declarado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/SeonghuJeon/shortstop-pi05-sticky-ctx025
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- PR del benchmark Shortstop: https://github.com/worv-ai/worv/pull/124
- Comentario con diferencias de runtime: https://github.com/worv-ai/worv/pull/124#issuecomment-6433366546
