# seantangth/macvi-wacv2027-mvo-apc-tdc

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino los pesos entrenados y la caché de resultados del equipo APC_TDC para el reto de odometría visual marítima MaCVi @ WACV 2027. Se trata de un artefacto de competición que acompaña a un repositorio de código en GitHub y que documenta una entrada final con un error de deriva del 12,57 % y un hash de bundle SHA-256 concreto. Su relevancia es acotada: sirve para reproducir exactamente los resultados de esa submission y para auditar el pipeline, no para uso general como modelo de propósito general.

El contenido se organiza en dos carpetas. La primera, `weights/`, incluye dos modelos de velocidad entrenados únicamente con el split de entrenamiento: una regresión ridge serializada en JSON (`ridge_train46.json`) y una compuerta CNN con cinco semillas (`cnn_gate/seed{0..4}.pt`) de 93 000 parámetros cada una, junto con sumas de verificación y un manifiesto de pesos externos que apunta a checkpoints públicos (VGGT-1B, RAFT-large y DPVO) sin copiarlos. La segunda, `cache/`, contiene salidas intermedias verificadas de las cuatro etapas de GPU y de la entrada de la fase de ensamblaje final, derivadas de los clips de test de LOOKOUT VO.

La ficha se redacta como la de cualquier otro artefacto publicado en Hugging Face, pero conviene subrayar que muchas de las categorías habituales (contexto, cuantización, idiomas, benchmarks de razonamiento) no aplican a este tipo de entrega. Cuando un dato no está en la información disponible se indica explícitamente. El repositorio tiene un tamaño de 0,0 GB y, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de odometría visual con dos modelos de velocidad: regresión ridge y compuerta CNN; pesos externos VGGT-1B, RAFT-large y DPVO |
| Parámetros totales | 93 000 por semilla en la compuerta CNN; ridge sin recuento de parámetros disponible; pesos externos no incluidos en el repo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT para los pesos y el código; caché derivada de LOOKOUT VO sujeta a CC BY-NC 4.0 (uso no comercial) |
| Formato de pesos | JSON (ridge) y PyTorch `.pt` (CNN); checkpoints externos referenciados en `external_weights.yaml` |
| Tarea | Odometría visual marítima (estimación de trayectoria) |
| Semillas entrenadas | 5 (`seed0` a `seed4`) |
| Deriva final reportada | 12,57 % |
| Hash del bundle | `76bbd5836ee27f19b41bbf70914c2d6eccad597feef46a6848f05fd6141d668e` |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico, sino un pipeline de odometría visual en el que se orquestan varios componentes. Los dos modelos propios son estimadores de velocidad: un modelo lineal ridge, ajustado sobre el split de entrenamiento y serializado como `ridge_train46.json`, y una compuerta CNN de cinco semillas de 93 000 parámetros cada una, almacenada en `cnn_gate/seed{0..4}.pt`. La compuerta parece encargarse de ponderar o seleccionar la señal de velocidad entre fuentes, mientras que el ridge actúa como estimador de referencia. Ambos se entrenaron exclusivamente con el split de entrenamiento, según declara la model card.

El resto de la capacidad de percepción proviene de checkpoints públicos que no se copian en el repositorio, sino que se enlazan en `external_weights.yaml`: VGGT-1B, RAFT-large y DPVO. VGGT-1B aporta geometría y estimación de estructura a partir de imágenes; RAFT-large proporciona flujo óptico denso; DPVO es un sistema de odometría visual basado en parches. La pipeline completa se ejecuta en cuatro etapas de GPU y una fase de ensamblaje final cuyas entradas quedan registradas en `cache/`. No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si hubo ajuste por RLHF o DPO, algo que tampoco corresponde a este dominio.

La innovación técnica principal es de ingeniería de competición: la separación entre pesos propios ligeros, checkpoints externos referenciados y una caché de intermedios verificada que permite reproducir el resultado exacto. La reproducibilidad se refuerza con `SHA256SUMS`, el hash del bundle y un script `reproduce/reproduce_all.sh` con tres modos (A0, A, B) que se ejecuta desde el repositorio de GitHub.

## Capacidades

- Estimación de odometría visual en entornos marítimos, con deriva final reportada del 12,57 % en el conjunto de evaluación del reto.
- Predicción de velocidad mediante regresión ridge y compuerta CNN con cinco semillas para promediar o seleccionar.
- Integración de flujo óptico denso (RAFT-large) y odometría por parches (DPVO) dentro de un pipeline de cuatro etapas de GPU.
- Uso de geometría basada en VGGT-1B como componente externo del pipeline.
- Reproducción determinista del resultado mediante caché de intermedios verificada y sumas SHA-256.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de generación de texto, de código ni de matemáticas simbólicas.
- No dispone de modo de pensamiento, visión general, audio ni otras capacidades multimodales más allá del procesamiento de imagen para odometría.

## Casos de uso

- Reproducción de la submission #19363: ejecutar `bash reproduce/reproduce_all.sh A0|A|B` desde el repositorio de GitHub con los pesos y la caché de este repo permite regenerar exactamente el resultado con deriva del 12,57 %, lo que sirve para auditar la entrada y verificar el hash del bundle.
- Auditoría de resultados de competición: los revisores pueden comprobar que las salidas intermedias de las cuatro etapas de GPU y de la fase de ensamblaje son coherentes con las sumas de verificación publicadas, sin necesidad de reentrenar.
- Investigación en odometría visual marítima: el pipeline combina VGGT-1B, RAFT-large y DPVO con estimadores de velocidad ligeros, y puede servir como línea base para comparar variantes sobre los clips de test de LOOKOUT VO.
- Estudio de ensembles de semillas: la compuerta CNN con cinco semillas de 93 000 parámetros permite analizar la varianza entre inicializaciones y el efecto de promediar o seleccionar modelos en una tarea de regresión de velocidad.
- Desarrollo de sistemas de navegación para embarcaciones no tripuladas: la estimación de velocidad y trayectoria a partir de vídeo es aplicable a vehículos de superficie en escenarios con poca textura y movimiento de cámara, siempre que se respete la restricción no comercial de la caché.
- Docencia y experimentación con pipelines de percepción: el repositorio ilustra cómo separar pesos propios, checkpoints externos y caché verificada para hacer reproducible un sistema de visión por computador de varias etapas.
- Reutilización de los pesos MIT: `ridge_train46.json` y `cnn_gate/seed{0..4}.pt` pueden reutilizarse bajo licencia MIT en otros proyectos, con la salvedad de que los datos de la caché no heredan esa licencia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Deriva en la evaluación del reto MaCVi @ WACV 2027 | 12,57 % |
| Submission | macvi.org #19363 |
| Hash del bundle | `76bbd5836ee27f19b41bbf70914c2d6eccad597feef46a6848f05fd6141d668e` |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende de los checkpoints externos (VGGT-1B, RAFT-large, DPVO) y de la resolución de los clips, no de los 93 000 parámetros de la compuerta CNN, que son despreciables.
- GPU recomendadas: no especificadas en la información disponible; el pipeline declara cuatro etapas de GPU, lo que sugiere al menos una GPU dedicada con memoria suficiente para VGGT-1B y RAFT-large.
- ¿Cabe en GPU de consumo? No disponible. Los modelos propios sí caben con holgura, pero los checkpoints externos condicionan el requisito real.
- Opciones de despliegue: ejecución mediante el script `reproduce/reproduce_all.sh` del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este dominio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Parámetros propios | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APC_TDC (este repo) | Pipeline de odometría visual con ridge + CNN gate | 93 k por semilla CNN; ridge sin recuento | No aplica | MIT (pesos); caché CC BY-NC 4.0 | Hugging Face y GitHub |
| DPVO | Odometría visual por parches | No disponible | No aplica | No disponible en esta ficha | Checkpoint público referenciado |
| RAFT-large | Flujo óptico denso | No disponible | No aplica | No disponible en esta ficha | Checkpoint público referenciado |
| VGGT-1B | Geometría y estructura a partir de imágenes | 1 B (según denominación) | No aplica | No disponible en esta ficha | Checkpoint público referenciado |

La comparación directa con otros sistemas de odometría visual marítima no está disponible en la información proporcionada. Los tres checkpoints externos no son alternativas, sino componentes del mismo pipeline, por lo que la tabla solo contextualiza su papel.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no admite tool calling; cualquier expectativa en ese sentido es un error de categoría.
- La licencia MIT cubre los pesos propios y el código, pero la caché deriva de los clips de test de LOOKOUT VO, publicados bajo CC BY-NC 4.0, y por tanto queda restringida a uso no comercial con atribución a LOOKOUT Visual Odometry Challenge, MaCVi @ WACV 2027.
- El resultado de 12,57 % de deriva corresponde a una única submission (#19363) y a un conjunto de evaluación concreto; no debe extrapolarse a otros escenarios marítimos ni a otras condiciones de iluminación o mar.
- Los pesos propios se entrenaron solo con el split de entrenamiento, lo que limita su generalización fuera de la distribución de LOOKOUT VO.
- El repositorio no incluye los checkpoints externos (VGGT-1B, RAFT-large, DPVO); sin ellos el pipeline no se puede ejecutar, y sus licencias y requisitos deben consultarse por separado en `external_weights.yaml`.
- El tamaño del repositorio es de 0,0 GB y no registra descargas ni likes, lo que sugiere un artefacto de competición sin validación comunitaria independiente.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no aplican; el riesgo principal es la fragilidad del pipeline ante dominios visuales distintos del marítimo.
- Para producción, la falta de latencia, throughput y requisitos de VRAM documentados obliga a medirlos empíricamente antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/seantangth/macvi-wacv2027-mvo-apc-tdc
- Repositorio de código: https://github.com/seantangth/macvi-wacv2027-mvo-apc-tdc
- Reto MaCVi @ WACV 2027: https://macvi.org
- LOOKOUT Visual Odometry Challenge (origen de los clips de test, CC BY-NC 4.0): no disponible como URL directa en la información proporcionada
- Checkpoints externos (VGGT-1B, RAFT-large, DPVO): referenciados en `external_weights.yaml` del repositorio, sin URL directa en la información proporcionada
