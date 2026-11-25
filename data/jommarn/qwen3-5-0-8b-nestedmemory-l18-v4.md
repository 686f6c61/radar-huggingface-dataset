# Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v4

## Resumen

Qwen3.5-0.8B-NestedMemory-L18-v4 es un checkpoint de investigación publicado por el usuario Jommarn que parte del modelo base Qwen/Qwen3.5-0.8B (congelado) y le añade una capa de memoria denominada NestedMemoryLayer tras la capa 18 del decodificador. El objetivo es dotar a un modelo pequeño de memoria a largo plazo persistente en sus propios pesos: los hechos que el usuario cuenta durante la conversación se escriben en la memoria y se recuperan en sesiones posteriores sin usar RAG ni código de recuperación externo, con compuertas neuronales aprendidas como único mecanismo de control.

La propuesta se enmarca en las líneas de investigación sobre memoria en tiempo de test (test-time memory), aprendizaje anidado y arquitecturas tipo Titans/Atlas. El repositorio ocupa 3,1 GB e incluye dos variantes de checkpoint (d_mem 512 y 256) junto con el código de entrenamiento y evaluación. Es un modelo multilingüe limitado a tailandés e inglés, con licencia Apache 2.0.

Es relevante ahora porque explora una alternativa a la ventana de contexto y al RAG para memoria persistente en modelos pequeños, pero el propio autor lo etiqueta como checkpoint de investigación: la memoria cargada degrada la conversación general (precisión de conocimiento general del 92 % al 71 %) y el modelo falla en simulaciones de vida completas de 90 días y unas 30 sesiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B congelado) + NestedMemoryLayer tras la capa 18 del decodificador |
| Parametros totales | no disponible (el modelo base es de 0,8B; el checkpoint añade la capa de memoria, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato .pt, no se documentan cuantizaciones) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt): `unified_nested_L18_v4_atlas_wide_blank.pt` y `unified_nested_L18_v4_atlas_blank.pt` |

## Arquitectura y entrenamiento

El modelo mantiene congelado el Qwen3.5-0.8B y añade una NestedMemoryLayer en la posición 18 del decodificador. La memoria es de tipo Atlas con "shift-key" (poly 24, Omega 16, Muon) y dos anchos disponibles: d_mem 512 (variante wide, recomendada) y d_mem 256. La escritura y lectura de la memoria se gobiernan mediante compuertas neuronales aprendidas, sin recuperación externa ni RAG. El entrenamiento partió de un warm-start desde el checkpoint v3_atlas y se ejecutó durante 8000 pasos, aunque la publicación corresponde al mejor checkpoint de validación en el paso 5600 (la ejecución se interrumpió hacia el paso 5900 por un incidente en la nube).

Los datos de entrenamiento convierten conjuntos públicos de memoria en episodios del tipo "contar → interferencia → preguntar": iapp_wiki_qa_squad (QA de Wikipedia en tailandés), bAbI (seguimiento de estado), MSC (charla multi-sesión como interferencia) y un generador estilo RULER de clave aleatoria → valor aleatorio (caracteres latinos, tailandeses, dígitos y códigos, con actualizaciones), además de los episodios sintéticos y de vida de v3. La mitad de los episodios incluyen de 1 a 3 sesiones de interferencia consolidadas con huecos de días entre el momento de contar y el de preguntar. El comportamiento general se protege únicamente mediante un término KL aplicado a unas pocas indicaciones generales.

## Capacidades

- Memoria a largo plazo persistente en pesos: escribe hechos narrados por el usuario y los recupera en sesiones posteriores mediante `memorize_text`, `end_session`, `forget(days=N)` y `generate(..., update_memory=False)`.
- Copia de valores arbitrarios nuevos: cadenas extrañas, números, nombres de mascotas, nombres propios y provincias, incluso con patrones de frase nunca vistos en entrenamiento.
- Consolidación entre sesiones y gestión del olvido por días (`memory.forget`).
- Seguimiento de estado tipo bAbI (rendimiento del 20-25 % en las comprobaciones held-out, frente al 10 % en el estado borrado).
- Conversación general y conocimiento general, aunque degradados cuando la memoria está cargada.
- Idiomas: tailandés e inglés (las frases solo en inglés fallan en su mayoría).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistentes personales con memoria entre sesiones: el modelo puede recordar datos contados en una conversación previa (por ejemplo, un código o un nombre) y recuperarlos días después, gracias a la consolidación con huecos temporales y a `forget(days=N)`.
- Investigación sobre memoria en tiempo de test: sirve como banco de pruebas reproducible para comparar escritura en pesos frente a RAG o ventanas de contexto largas, con scripts de evaluación incluidos (`eval_v4_ood.py`, `eval_chat_return.py`, `eval_nested.py`).
- Prototipos de agentes conversacionales en tailandés: el modelo está entrenado con QA de Wikipedia tailandesa y charla multi-sesión, por lo que es adecuado para experimentos de diálogo en ese idioma.
- Seguimiento de estado en tareas de diálogo: los episodios tipo bAbI permiten usarlo en prototipos que deben recordar el estado de una tarea a lo largo de turnos, aceptando su precisión limitada.
- Evaluación de olvido selectivo: el método `forget(days=N)` permite experimentar con políticas de retención y caducidad de recuerdos en un modelo pequeño desplegable en una sola GPU.
- Docencia y reproducción de experimentos: el código de entrenamiento (`train_v4.py`) y los checkpoints permiten reproducir el pipeline de episodios contar/interferir/preguntar con datasets públicos.

## Benchmarks y rendimiento

Resultados publicados por el autor (el modelo base es Qwen3.5-0.8B; "wiped" es el mismo modelo tras `reset_memory()`).

Prueba OOD con patrones de frase nunca vistos en entrenamiento (600 elementos, la mitad con 3 sesiones de interferencia):

| Tipo (ejemplo) | v4_atlas_wide inmediato | tras 3 sesiones | v4_atlas inmediato | wiped |
|---|---|---|---|---|
| Cadena extraña (`รหัสเข้าบ้านหลังใหม่คือ vSphMSXU`) | 82 % | 64 % | 72 % | 0 % |
| Número (`บ้านเลขที่ของผมคือ 57003`) | 63 % | 47 % | 63 % | 0 % |
| Nombre de mascota que es palabra real | 60 % | 35 % | 63 % | 0 % |
| Nombre con patrón nuevo | 51 % | 22 % | 46 % | 0 % |
| Nombre extranjero | 32 % | 19 % | 35 % | 0 % |
| Provincia | 30 % | 26 % | 30 % | 0 % |
| Todos | 48,2 % | — | 46,7 % | 0 % |

Dataset de vida real, protocolo corto (validación, 222 preguntas):

| Versión | Total | Wiped | Nombre | Ocupación |
|---|---|---|---|---|
| v2 | 5,1 % | 2,3 % | 0 % | 0 % |
| v3_atlas | 40,5 % | 1,8 % | 36 % | 68 % |
| v4_atlas | 53,2 % | 2,7 % | 54 % | 85 % |
| v4_atlas_wide | 59,9 % | 2,3 % | 61 % | 91 % |

Conversación y retorno al hecho (40 conversaciones × 2 modos):

| Métrica | Chat nuevo en cada turno (solo memoria) | Chat continuo |
|---|---|---|
| Hecho recordado a mitad | 67 % | 74 % |
| Hecho recordado al final | 60 % (wiped: 0 %) | 73 % |
| Respuestas de conocimiento general correctas | 71 % (Qwen original: 92 %) | 67 % (Qwen original: 93 %) |
| Fuga del valor recordado a respuestas no relacionadas | 17 % | 18 % |

Simulación de vida completa (19 vidas no vistas, 90 días, ~30 sesiones): v4_atlas_wide 8,2 % con memoria y 5,9 % wiped; nombre 0 %, ocupación 0 %.

Comprobaciones held-out durante el entrenamiento (20 elementos por prueba):

| Paso | Copia de valor aleatorio (ahora / tras 3 sesiones) | Hechos sintéticos (ahora / tras 3 sesiones) | bAbI (wiped 10 %) | iapp Wikipedia tailandesa |
|---|---|---|---|---|
| 0 (= v3_atlas) | 0 % / 0 % | 90 % / 10 % | 0 % | 0 % |
| 2400 | 30 % / 25 % | 75 % / 85 % | 35 % | 0 % |
| 5600 (publicado) | 60 % / 40 % | 100 % / 100 % | 20-25 % | 0-5 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 3,1 GB en formato .pt; el modelo base es de 0,8B y la capa de memoria añade parámetros adicionales, por lo que en bfloat16 debería caber con holgura en GPUs de consumo, aunque no hay cifras publicadas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU de consumo con al menos 8 GB de VRAM debería ser suficiente, pero el autor no lo documenta.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base y del checkpoint, sin confirmación oficial.
- Opciones de despliegue: la model card solo documenta carga mediante PyTorch con `QwenMemoryWrapper` y `torch.load`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato .pt no es directamente compatible con ellos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-NestedMemory-L18-v4 | 0,8B + capa de memoria | no disponible | Sí, en pesos con compuertas aprendidas | Apache 2.0 | Hugging Face (checkpoint de investigación) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | No | no disponible en la información proporcionada | Hugging Face |
| Qwen3.5-0.8B-NestedMemory-L18-v3 (versión previa del mismo autor) | 0,8B + capa de memoria | no disponible | Sí | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor advierte de que no debe usarse en producción sin asumir sus limitaciones.
- La memoria cargada degrada la conversación general: la precisión de conocimiento general cae del 92 % al 71 % y el valor recordado se filtra a respuestas no relacionadas en el 17 % de los casos.
- Fallos observados: respuestas en la plantilla de memoria a charla informal (por ejemplo, "hoy estoy muy cansado, ¿qué hago?" → "nunca me has contado esto"), respuestas muy cortas y respuestas incorrectas a preguntas generales.
- No resuelve la simulación de vida completa: con ~30 sesiones los hechos almacenados se sobrescriben; el entrenamiento solo cubrió hasta 3 sesiones de interferencia.
- Preguntas sobre eventos de vida débiles: detalle de episodios 0-18 %, temporales 10 %, multi-hop 11 %.
- Las frases solo en inglés fallan en su mayoría; el rendimiento está centrado en tailandés.
- Riesgo de alucinación en respuestas generales cuando la memoria está activa, por la fuga de valores recordados.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías por parte del autor.
- Formato de pesos .pt con código propio: requiere cargar el modelo con el wrapper del repositorio, lo que complica su integración en pilas de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v4
- Versión previa v3: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset iapp_wiki_qa_squad: https://huggingface.co/datasets/iapp/iapp_wiki_qa_squad
- Dataset bAbI: https://huggingface.co/datasets/Muennighoff/babi
- Dataset MSC (multi-session chat): https://huggingface.co/datasets/nayohan/multi_session_chat
- Dataset Thai-LifeSim-PersonalMemory: https://huggingface.co/datasets/Jommarn/Thai-LifeSim-PersonalMemory
