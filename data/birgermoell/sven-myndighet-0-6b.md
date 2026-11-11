# birgermoell/sven-myndighet-0.6b

## Resumen

sven-myndighet-0.6b es un adaptador LoRA (con cabeza de puntero) sobre el modelo base Qwen/Qwen3-0.6B-Base, desarrollado por birgermoell y orientado a la clasificación de resultados en expedientes de la administración pública sueca. El modelo no genera decisiones abiertas: responde preguntas tipadas de opción múltiple y sí/no sobre desenlaces de casos (solicitudes de ayuda estudiantil del CSN, situaciones de la förvaltningslagen, y resoluciones de ÖKS, ÖNH, JO y Skolinspektionen). Se entrenó sobre la configuración `sven` del dataset birgermoell/myndighetsbeslut.

Se trata de una release experimental de investigación, no validada para decidir casos reales. El autor advierte explícitamente que cualquier uso requiere un responsable humano de la decisión. El adaptador no es un modelo conversacional autónomo: debe cargarse con el código del framework `kev` mediante `Checkpoint(...).load`, y requiere `--max_state 7552` porque el valor por defecto de evaluación de kev (384 tokens) rechaza la mayoría de expedientes.

Con 0,6 mil millones de parámetros en el base y un adaptador LoRA de rango 16, el modelo es deliberadamente pequeño y especializado. Su relevancia radica en demostrar que un ajuste fino ligero sobre un modelo base reducido puede aprender reglas procedimentales de dominios administrativos concretos, aunque los propios resultados publicados muestran límites claros de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (rank 16) y cabeza de puntero |
| Parametros totales | 0,6B (modelo base Qwen/Qwen3-0.6B-Base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la evaluación requiere `--max_state 7552` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 (adaptador); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B-Base, un transformer decoder-only de 0,6B parámetros, sobre el que se aplica un adaptador LoRA de rango 16 junto con una cabeza de puntero para preguntas de clasificación tipadas. El ajuste se realizó durante una época sobre 16 600 registros del dataset birgermoell/myndighetsbeslut (configuración `sven`), con learning rate 2e-5, precisión bf16 y una única GPU H200 en el clúster NSC Berzelius. El adaptador se entrenó como delta sobre birgermoell/sven-0.6b.

No se mezclaron datos de replay, por lo que la capacidad general del modelo tras el ajuste fino no se ha medido. El entrenamiento se apoya en decisiones públicas con datos identificativos eliminados por las autoridades y por el recolector del autor; los casos del CSN son sintéticos. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Respuesta a preguntas de opción múltiple y sí/no sobre desenlaces de expedientes administrativos suecos.
- Clasificación del resultado de solicitudes de ayuda estudiantil del CSN.
- Predicción del siguiente paso procedimental en situaciones de la förvaltningslagen.
- Identificación de deficiencias por área e intervención en resoluciones de Skolinspektionen.
- Predicción de si un recurso fue estimado a favor del recurrente en resoluciones de ÖKS.
- Predicción de si la autoridad fue criticada en resoluciones del JO.
- Predicción del desenlace en resoluciones de ÖNH.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido según la información disponible.
- Capacidad multilingüe limitada al sueco.

## Casos de uso

- Triaje de expedientes del CSN en un entorno de investigación: el modelo clasifica el desenlace probable de una solicitud de ayuda estudiantil a partir de los hechos del expediente, con una precisión del 0,83 en el conjunto de validación, útil para priorizar revisiones humanas.
- Asistencia a la revisión procedimental: predice el siguiente paso en situaciones de la förvaltningslagen con una precisión del 0,93 en validación, lo que permite generar borradores de checklist para funcionarios que después validan manualmente.
- Análisis de resoluciones de Skolinspektionen: identifica deficiencias por área (0,88) y el tipo de intervención (0,81), adecuado para tareas de catalogación y estadística interna sobre resoluciones históricas.
- Investigación académica sobre ajuste fino en dominios legales: sirve como caso de estudio reproducible de LoRA de rango 16 sobre un base de 0,6B, con código, constructores de datos y script de evaluación publicados.
- Evaluación comparativa de modelos pequeños en clasificación administrativa: el modelo puede actuar como línea base frente a modelos mayores en tareas de clasificación tipada sobre expedientes suecos.
- Prototipado de asistentes de decisión con supervisión humana: en un flujo donde el modelo propone una clasificación y un revisor humano confirma o corrige, siempre que se asuma su naturaleza experimental y no validada para casos reales.
- Extracción de señales en corpus de decisiones públicas: clasificación masiva de resoluciones para construir indicadores agregados, con la advertencia de que las categorías ÖKS, ÖNH y JO no alcanzan fiabilidad suficiente.

## Benchmarks y rendimiento

Resultados en el conjunto de validación (2 005 registros, decisiones fechadas entre 2026-05-07 y 2026-11-10; ninguno rechazado). Precisión, con la proporción de la respuesta más común entre paréntesis.

| Pregunta | Más común | Zero-shot | Entrenado |
|---|---:|---:|---:|
| CSN outcome | 0,50 | 0,22 | 0,83 |
| Procedural next step | 0,28 | 0,44 | 0,93 |
| Skolinspektionen: deficiency per area | 0,66 | 0,54 | 0,88 |
| Skolinspektionen: intervention | 0,54 | 0,29 | 0,81 |
| ÖKS: changed in appellant's favour | 0,86 | 0,56 | 0,86 |
| JO: authority criticised | 0,87 | 0,78 | 0,86 |
| ÖNH: outcome | 0,35 | 0,32 | 0,21 |

Las métricas completas por pregunta (macro-F1, calibración, AUROC) están en el repositorio del dataset, bajo `results/`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 0,6B parámetros en el base, el adaptador LoRA añade una sobrecarga mínima, pero el framework `kev` y la ventana `--max_state 7552` condicionan el consumo real.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H200; para inferencia no se especifican requisitos.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del base sugiere que podría caber en GPUs de consumo, pero no hay datos publicados al respecto.
- Opciones de despliegue: carga mediante el código de `kev` (`Checkpoint(...).load`); no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI según la información disponible, al no ser un modelo conversacional autónomo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sven-myndighet-0.6b | 0,6B (base) + LoRA rank 16 | no disponible | Clasificación de expedientes administrativos suecos | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-0.6B-Base | 0,6B | no disponible | Modelo base generalista | Apache-2.0 | Hugging Face |
| Alternativas especializadas en clasificación legal sueca | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría y tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- Release experimental de investigación: no validada para decidir casos reales; cualquier uso requiere un responsable humano de la decisión.
- Las puntuaciones de CSN y del siguiente paso procedimental demuestran que el modelo aprendió las reglas del generador de datos, no que lea expedientes reales.
- ÖKS cuenta con 72 preguntas de validación (unas 10 apelaciones estimadas) y ÖNH con 34; las diferencias en esas categorías están al nivel del ruido, y el base podría haber visto esas decisiones públicas.
- JO no está aprendido: el modelo responde la clase mayoritaria (0,86 frente a 0,87 de la clase más común).
- Sin datos de replay: la capacidad general tras el ajuste fino no se ha medido.
- Entrenado sobre decisiones públicas con datos identificativos eliminados por las autoridades y por el recolector; los casos del CSN son sintéticos.
- El adaptador no es un modelo conversacional autónomo y requiere el framework `kev` para su carga.
- El valor por defecto de evaluación de kev (384 tokens) rechaza la mayoría de expedientes; es necesario pasar `--max_state 7552`.
- Idiomas: solo sueco.
- Licencia Apache-2.0 para el adaptador, alineada con el base; los datos de entrenamiento son CC BY 4.0.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/birgermoell/sven-myndighet-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo previo: https://huggingface.co/birgermoell/sven-0.6b
- Dataset: https://huggingface.co/datasets/birgermoell/myndighetsbeslut
- Repositorio de código: https://github.com/BirgerMoell/myndighetsagenter
- Framework kev: https://github.com/jaredpalmer/kev
