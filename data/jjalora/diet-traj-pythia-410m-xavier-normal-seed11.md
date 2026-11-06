# jjalora/diet-traj-pythia-410m-xavier-normal-seed11

## Resumen

DIET trajectory: Pythia-410M con inicialización `xavier_normal` y semilla 11 es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña de espacio de pesos "DIET". No es un modelo pensado para uso conversacional o de producción, sino una reproducción desde cero del entrenamiento de Pythia-410M de EleutherAI en la que se modifica únicamente la semilla aleatoria y el esquema de inicialización de pesos (aquí `xavier_normal`, frente al `small_init` + `wang_init` que usa GPT-NeoX/Pythia). El objetivo es estudiar cómo varía la trayectoria de entrenamiento en el espacio de pesos ante esos cambios controlados.

Arquitectónicamente es un transformer denso tipo GPT-NeoX de 405.334.016 parámetros (unos 410M), entrenado sobre el mismo flujo de tokens y en el mismo orden que Pythia (`EleutherAI/pile-standard-pythia-preshuffled`), con la misma receta de optimización documentada en el YAML oficial de Pythia-410M. El resultado es un modelo de generación de texto en inglés con checkpoints intermedios frecuentes, útil para análisis de dinámica de entrenamiento, no para tareas de usuario final.

Su relevancia es metodológica: permite comparar trayectorias de pesos entre inicializaciones y semillas distintas manteniendo constante todo lo demás (datos, orden, hiperparámetros), algo poco habitual en la literatura abierta. El repo es de gran tamaño (1167,4 GB) por acumular decenas de checkpoints en float16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only tipo GPT-NeoX (`gpt_neox`) |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-410M usa 2048 tokens como referencia de la familia) |
| Tipos de cuantizacion | no disponible; pesos publicados en float16 safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de Pythia-410M: transformer decoder-only con atención causal estándar (no se documentan variantes como atención lineal o SSM), capas pre-LayerNorm y embeddings rotatorios según la implementación GPT-NeoX. La única desviación respecto al modelo original es el esquema de inicialización (`xavier_normal`) y la semilla (11); el resto de la receta es idéntica: AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni biases, grad clip 1.0, scheduler coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 secuencias × 2048 tokens.

Los datos son el flujo prebarajado `EleutherAI/pile-standard-pythia-preshuffled`, con el batch *i* correspondiente a las filas [i·1024, (i+1)·1024], de modo que el orden de tokens es exactamente el de Pythia. El entrenamiento se ejecutó en 8 nodos con 4 GPU A100-PCIE-40GB cada uno (32 GPU en total), micro-batch 4, en dos jobs (383972 y 384034) iniciados el 24 de octubre de 2026. Se publican checkpoints en ramas `stepN` para N en {0, 1, 2, 4, …, 512} más cada 100 pasos, con solo pesos. El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks; el esquema `pythia` se valida por coincidencia de distribución por tensor contra `EleutherAI/pythia-410m` revisión `step0` en `tests/test_pythia_step0_init_match.py`. No se documenta RLHF, DPO ni ajuste de instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la receta Pythia-410M.
- Modelado de lenguaje base: útil para evaluación de perplejidad y análisis de representaciones.
- Checkpoints intermedios frecuentes que permiten estudiar la evolución de capacidades a lo largo del entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No se documenta modo thinking, visión ni audio.
- No es un modelo ajustado por instrucciones; no cabe esperar formato conversacional fiable.

## Casos de uso

- Investigación en dinámica de entrenamiento: comparar la trayectoria de pesos de esta ejecución con otras semillas y esquemas de inicialización de la misma campaña para medir sensibilidad a la inicialización.
- Análisis de espacio de pesos: usar los checkpoints `stepN` para estudiar la geometría de la pérdida, la norma de actualizaciones por capa o la rotación de subespacios a lo largo de 143.000 pasos.
- Reproducibilidad y auditoría de recetas: servir como referencia controlada de la receta Pythia-410M con datos y orden idénticos, útil para validar pipelines de entrenamiento propios.
- Evaluación de técnicas de merging o interpolación de pesos: al disponer de múltiples semillas con el mismo flujo de datos, es un banco de pruebas natural para model souping y linear mode connectivity.
- Detección de memorización y contaminación: comparar la perplejidad en subconjuntos del Pile entre checkpoints y semillas para aislar efectos del orden de datos frente a los de la inicialización.
- Docencia y experimentación con modelos pequeños: 405M parámetros permiten ejecutar experimentos de interpretabilidad en hardware modesto sin depender de modelos propietarios.
- Generación de texto en inglés como línea base: útil como referencia de un modelo base no alineado en comparaciones de calidad de texto, no como asistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de perplejidad para este checkpoint concreto.

## Requisitos de hardware

- Inferencia en float16: aproximadamente 0,81 GB solo para pesos (405M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 2,5 GB de VRAM para contextos cortos.
- Cuantización a 8 bits: en torno a 0,4 GB de pesos; a 4 bits, en torno a 0,2 GB, aunque el autor no publica versiones GGUF y habría que generarlas.
- Cabe holgadamente en cualquier GPU de consumo con 6 GB o más (RTX 3060, 4060, 4070, 4090) e incluso en CPU para inferencia de baja concurrencia.
- GPU recomendadas para reproducir el entrenamiento: A100-PCIE-40GB, tal como documenta el autor (32 GPU en 8 nodos); para inferencia basta una sola GPU moderna.
- Despliegue: compatible con `transformers` y con `text-generation-inference` según los tags; también es viable convertir a GGUF para llama.cpp u Ollama, aunque no se distribuye en ese formato.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un modelo denso de 405M en una RTX 4090 debería ofrecer decenas o cientos de tokens por segundo en batch pequeño, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-xavier-normal-seed11 | 405M | no disponible | Apache 2.0 | Hugging Face | Reproducción con init `xavier_normal`, seed 11; checkpoints intermedios |
| EleutherAI/pythia-410m | 410M | 2048 | Apache 2.0 | Hugging Face | Modelo de referencia de la receta; init `small_init` + `wang_init` |
| EleutherAI/pythia-410m-deduped | 410M | 2048 | Apache 2.0 | Hugging Face | Variante entrenada sobre el Pile deduplicado |
| Cerebras-GPT-590M | 590M | 2048 | Apache 2.0 | Hugging Face | Alternativa de tamaño cercano, receta y datos distintos |

No se dispone de comparaciones de rendimiento entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base no alineado: no ha pasado por RLHF, DPO ni ajuste de instrucciones, por lo que puede generar contenido sesgado, tóxico o incorrecto sin filtros.
- Riesgo de alucinación alto en cualquier uso generativo; no debe emplearse como fuente de hechos.
- Entrenado únicamente en inglés; el rendimiento en castellano será deficiente.
- La longitud de contexto efectiva no se documenta en la model card; conviene asumir la de la familia Pythia (2048 tokens) hasta verificación.
- No es un modelo de producción: su propósito es la investigación sobre trayectorias de entrenamiento.
- El repo ocupa 1167,4 GB por la acumulación de checkpoints; la descarga completa es inviable en la mayoría de entornos y conviene descargar solo la rama `main` o checkpoints concretos.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; las comparaciones con `EleutherAI/pythia-410m` deben hacerse a nivel de distribución, no de pesos exactos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación y de evaluaciones de seguridad hace desaconsejable su despliegue directo ante usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-xavier-normal-seed11
- Repositorio de referencia Pythia: https://github.com/EleutherAI/pythia
- Modelo base de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Paper de Pythia: https://arxiv.org/abs/2304.01373
