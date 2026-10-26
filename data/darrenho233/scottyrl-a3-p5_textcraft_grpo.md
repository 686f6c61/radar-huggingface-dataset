# DarrenHo233/scottyrl-a3-p5_textcraft_grpo

## Resumen

`DarrenHo233/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado en HuggingFace por el usuario DarrenHo233. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (0,2 GB en safetensors) que debe cargarse junto con el modelo base mediante la librería PEFT. El adaptador se ha entrenado con el framework `scottyrl` en el marco de la asignatura 11-768 (AI Agents) de CMU, correspondiente al Assignment 3, bajo el nombre de ejecución `p5_textcraft_grpo`.

El objetivo declarado del adaptador es actuar como política de agente en la tarea TextCraft-Synth, un entorno de texto con validaciones de dificultad media y alta. El sufijo `grpo` del nombre de la ejecución sugiere un entrenamiento con Group Relative Policy Optimization, si bien la model card no detalla hiperparámetros, composición del dataset ni número de pasos. La relevancia del artefacto es fundamentalmente metodológica: ejemplifica el ciclo completo de post-entrenamiento con RL sobre un modelo pequeño y su distribución como adaptador ligero, reproducible mediante `vLLM` con soporte LoRA.

No se han publicado resultados de benchmarks, licencia ni cobertura de idiomas en la información disponible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto académico sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 32 sobre un transformer decoder-only `Qwen/Qwen3.5-4B` |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "4B" (aprox. 4000 millones por nomenclatura del autor, sin confirmar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la hereda del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | No disponible para el adaptador; los pesos se distribuyen en safetensors. La cuantizacion depende del modelo base y del servidor de inferencia |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0,2 GB |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Framework de entrenamiento | `scottyrl` (run `p5_textcraft_grpo`, config `configs/p5_textcraft_grpo.yaml`) |
| Libreria de carga | `peft` |
| Tarea de evaluacion | TextCraft-Synth, splits de validacion `medium` y `hard`, con `k=4` |
| Commit de referencia | `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e` |
| Autor | DarrenHo233 |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-4B`, un transformer decoder-only del que no se aportan especificaciones en la informacion disponible. Sobre el se aplica un adaptador LoRA de rango 32, que congela los pesos originales e inyecta matrices de baja dimensionalidad en determinadas capas; esto reduce el almacenamiento a 0,2 GB y permite servir el adaptador junto al modelo base sin duplicar los 4B parametros. La model card no especifica en que modulos se aplica el LoRA, el valor de `alpha`, el dropout ni la precision de entrenamiento.

El entrenamiento se ha realizado con el framework `scottyrl`, con nombre de ejecucion `p5_textcraft_grpo` y configuracion `configs/p5_textcraft_grpo.yaml`. El sufijo `grpo` apunta a un esquema de optimizacion por politica con grupos de muestras y recompensa, habitual en entornos de agentes con verificacion programatica; sin embargo, la informacion proporcionada no confirma la funcion de recompensa, el numero de rollouts, la composicion del dataset ni si hubo fases previas de SFT. Tampoco se documenta la procedencia de los datos de TextCraft-Synth ni si los splits de validacion empleados en la evaluacion quedaron fuera del entrenamiento.

## Capacidades

- Generacion de texto condicionada por el modelo base `Qwen/Qwen3.5-4B`, no documentada de forma independiente para el adaptador.
- Actuacion como politica de agente en el entorno TextCraft-Synth: seleccion de acciones en un bucle multi-paso orientado a objetivos.
- Razonamiento multi-paso y planificacion secuencial, implícitos en la tarea de entrenamiento (crafteo de objetos a partir de recetas).
- Servicio simultaneo con el modelo base en `vLLM` mediante `--enable-lora --max-lora-rank 32`, lo que permite comparar politicas sin levantar procesos adicionales.
- Capacidades de tool calling, function calling, vision, audio o modo "thinking": no documentadas en la model card; no deben asumirse.
- Capacidades multilingues: no documentadas.

## Casos de uso

- **Replicacion de experimentos de RL para agentes**: cargar el adaptador con `vLLM` (`--enable-lora --max-lora-rank 32 --lora-modules a3=...`) y ejecutar `scripts/evaluate_checkpoint.py` sobre los splits `medium` y `hard` con `k=4` para reproducir la evaluacion del curso y obtener una linea base de pass@4.
- **Docencia y laboratorios de agentes**: servir como referencia resuelta del Assignment 3 de 11-768, permitiendo al alumnado comparar su propia politica contra un adaptador ya entrenado con la misma configuracion y el mismo commit de codigo.
- **Servicio multi-adaptador en produccion interna**: al ocupar 0,2 GB, decenas de adaptadores de tareas distintas pueden convivir en un unico servidor `vLLM` sobre una sola instancia del modelo base, con enrutado por el campo `model` de la API OpenAI-compatible.
- **Investigacion en recompensas verificables**: usar el adaptador como punto de partida (warm start) para nuevos ciclos de GRPO en entornos de texto con verificacion determinista, comparando curvas de aprendizaje frente al modelo base sin adaptar.
- **Evaluacion de pipelines de agentes**: emplear el par base + adaptador como "modelo bajo prueba" en arneses de evaluacion de planificadores, midiendo tasa de exito por dificultad y coste por episodio, dado que el adaptador es intercambiable sin re-desplegar el servidor.
- **Versionado ligero de politicas**: el formato de adaptador permite mantener un historial de politicas por checkpoint (0,2 GB cada una) en lugar de instantaneas completas del modelo de 4B, lo que simplifica la trazabilidad de experimentos.
- **Prototipado de asistentes de dominio acotado**: en escenarios internos de planificacion de tareas con inventario y reglas (analogos a crafteo), el adaptador puede evaluarse como politica especializada antes de invertir en un fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el protocolo de evaluacion, sin cifras:

```bash
vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 \
    --lora-modules a3=DarrenHo233/scottyrl-a3-p5_textcraft_grpo
python scripts/evaluate_checkpoint.py --config configs/p5_textcraft_grpo.yaml \
    --server http://localhost:8000/v1 --model a3 --k 4
python scripts/evaluate_checkpoint.py --config configs/p5_textcraft_grpo.yaml \
    --server http://localhost:8000/v1 --model a3 --k 4 \
    --tasks data/textcraft_val_hard.jsonl
```

| Benchmark | Splits | Metrica | Resultado |
|---|---|---|---|
| TextCraft-Synth | `textcraft_val` (medium) | k=4 | No publicado |
| TextCraft-Synth | `textcraft_val_hard` | k=4 | No publicado |
| MMLU / HumanEval / GSM8K | - | - | No evaluado en la informacion disponible |

## Requisitos de hardware

- **Peso del adaptador**: 0,2 GB en safetensors; el coste dominante es el modelo base de ~4B parametros.
- **VRAM estimada (inferencia)**: en BF16/FP16, aproximadamente 8-10 GB solo para pesos del base mas cache KV; en cuantizacion de 8 bits, en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB. Estimaciones aritmeticas a partir del tamano declarado, no medidas sobre este adaptador.
- **GPU consumer**: cabe con holgura en una RTX 4090 (24 GB) en BF16 y en una RTX 3060/4060 Ti (12-16 GB) si se cuantiza el base a 8 o 4 bits.
- **GPU de datacenter**: A100 40/80 GB, H100 o L40S para servir varias replicas o decenas de adaptadores concurrentes; L4/A10 suficientes para una instancia unica con carga moderada.
- **Despliegue recomendado**: `vLLM` con `--enable-lora --max-lora-rank 32`, que es exactamente el procedimiento documentado por el autor.
- **Alternativas de despliegue**: `transformers` + `peft` (`PeftModel.from_pretrained`) para depuracion; fusion del adaptador en el base (`merge_and_unload`) seguida de conversion a GGUF para `llama.cpp` u `Ollama` si se necesita CPU o edge.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por episodio.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada adaptadores publicos comparables (misma asignatura, misma tarea o mismo framework). La comparacion se limita al propio modelo base y a la alternativa de fine-tuning completo.

| Alternativa | Parametros | Contexto | Rendimiento en TextCraft-Synth | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA r32 sobre Qwen3.5-4B) | ~4B (base) + adaptador 0,2 GB | No disponible | No publicado | No disponible | Publico en HF, 0 descargas |
| `Qwen/Qwen3.5-4B` sin adaptar | ~4B | No disponible | No disponible | No disponible | Publico en HF |
| Fine-tuning completo de Qwen3.5-4B | ~4B | No disponible | No disponible | No disponible | Requiere entrenamiento propio |
| Otros adaptadores LoRA de la misma asignatura | No disponible | No disponible | No disponible | No disponible | No localizados en la busqueda |

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explicita no puede asumirse permiso de uso comercial; a efectos practicos debe tratarse como "todos los derechos reservados" hasta confirmacion del autor, que ademas queda condicionada por la licencia del modelo base `Qwen/Qwen3.5-4B`.
- **Artefacto sin validacion externa**: 0 descargas y 0 likes; no hay evidencia de terceros que reproduzcan los resultados.
- **Alcance funcional muy acotado**: entrenado para una unica tarea (TextCraft-Synth) en un contexto academico; no hay garantias de comportamiento fuera de ese dominio.
- **Riesgo de sobreajuste al conjunto de evaluacion**: no se documenta si los splits `medium` y `hard` usados en la evaluacion se excluyeron del entrenamiento, lo que impide descartar contaminacion.
- **Dependencia estricta del modelo base**: el adaptador no es autonomo; requiere `Qwen/Qwen3.5-4B` y la version concreta de `peft`/`transformers` compatible con el checkpoint.
- **Reproducibilidad parcial**: la configuracion `configs/p5_textcraft_grpo.yaml`, los scripts de evaluacion y el commit `ef42c0d3...` se referencian por rutas locales del autor (`/Users/Courses/11768AIAgents/assignment-3/runs/p5_adapter`) que no se distribuyen en el repositorio de HuggingFace.
- **Riesgo de alucinacion**: inherente a un modelo de ~4B sin datos de alineacion publicados; en tareas de agente se traduce en acciones invalidas o planes que no respetan las reglas del entorno.
- **Sesgos**: no evaluados ni documentados; no hay informacion sobre composicion del dataset de entrenamiento.
- **Ausencia de datos de seguridad**: sin informacion sobre filtros, moderacion o evaluaciones de riesgo.
- **Cobertura idiomatica desconocida**: no se declara ningún idioma; no debe asumirse un rendimiento solido en castellano.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/DarrenHo233/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del framework `scottyrl`: no disponible en la informacion proporcionada
- Paper o blog de `scottyrl`: no disponible en la informacion proporcionada
- Demo o space asociado: no disponible
- Nota sobre la busqueda web: los resultados devueltos corresponden a la plataforma PolyBuzz (chats con personajes de IA) y no guardan relacion con este modelo; se descartan por no ser enlaces relevantes.
