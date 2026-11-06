# nihar-damera/commit-suggestor

## Resumen

Commit Suggestor (v2) es un ajuste fino por LoRA de Qwen2.5-Coder-1.5B-Instruct especializado en una unica tarea: generar la linea de asunto de un commit de git a partir del diff correspondiente. Lo desarrolla nihar-damera y se distribuye bajo licencia Apache 2.0. El modelo parte de una base de 1.543.714.304 parametros y se publica en dos formatos: MLX 4-bit para Apple Silicon y GGUF Q4_K_M para llama.cpp en CPU.

La relevancia del proyecto no esta en el tamano, sino en el proceso: un ciclo completo de SFT seguido de DPO (con beta 0.3) sobre datos minados de 17 proyectos Python, con un pipeline de evaluacion explicito (450 commits de test de tres proyectos no vistos, intervalos bootstrap al 95% y un juez LLM con doble orden). El autor documenta tambien los fallos del proceso, como el acuerdo solo moderado entre el juez y el anotador humano (kappa de Cohen 0.232).

Es una pieza de infraestructura para desarrolladores: se integra como hook de git y sugiere el asunto en menos de 8 segundos, sin descargar nada durante el commit. No es un modelo de proposito general y su prompt esta fijado en `commit_suggestor/prompt.py` (version 2, sin contexto de repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-Coder-1.5B-Instruct, valor no confirmado en la model card) |
| Tipos de cuantizacion | MLX 4-bit y GGUF Q4_K_M (artefactos publicados); fp16 usado en evaluacion |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct. El ajuste se realiza con LoRA de rango 8 y alpha 160 sobre las 16 capas superiores de 28 y las 7 proyecciones lineales, lo que supone 5.28M parametros entrenables (0.34% del total). El entrenamiento se hizo con TRL sobre una Kaggle T4.

Los datos proceden de commits minados de 17 proyectos Python, con filtrado de bots, merges, releases, diffs gigantes y asuntos triviales; se eliminan casi duplicados con MinHash (Jaccard >= 0.8) y se limita a 4000 por proyecto, con particion por proyecto y nunca por commit. La fase SFT-v2 usa una epoca con learning rate 5e-5 y perdida solo sobre el asunto. La fase DPO genera 4 muestras por diff (T 0.9), las ordena con el juez en ambos ordenes y conserva 2198 pares donde ambos ordenes coinciden y el ganador no inventa nombres ni es generico; una epoca, learning rate 2e-5, perdida sigmoide y beta seleccionado entre {0.05, 0.1, 0.3} con una regla fijada en codigo antes de ver resultados. El contexto de repositorio (ultimos cinco asuntos) se entreno pero no se publica porque el juez prefirio asuntos sin el (27.3% de victorias con contexto).

## Capacidades

- Generacion de la linea de asunto de un commit de git a partir del diff, en ingles.
- Preferencia por asuntos especificos: nombra archivos o simbolos presentes en el diff (95.56% de asuntos especificos en test).
- Formato garantizado: 100% de asuntos bien formados en la evaluacion del modelo publicado.
- Control de longitud: recorta asuntos de mas de 72 caracteres en un limite de clausula (`prompt.fit_subject`).
- Integracion como hook de git (`commit-suggestor install-hook`) con limite de 8 segundos.
- Ejecucion local: MLX en Apple Silicon y llama.cpp en CPU via GGUF Q4_K_M.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Multilingue: solo ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Estandarizacion de mensajes de commit en equipos: el hook pre-rellena el asunto en `git commit`, lo que reduce la variabilidad de estilo entre desarrolladores sin salir del flujo de trabajo habitual.
- Revision de commits en CI: dado un diff, el modelo puede generar un asunto candidato para comparar con el escrito por el autor y marcar discrepancias en un pipeline de calidad.
- Entornos con restricciones de privacidad: al ejecutarse en local (MLX o llama.cpp), el diff no sale de la maquina, algo critico en repositorios propietarios.
- Desarrollo en portatiles Apple Silicon: la variante MLX 4-bit permite sugerencias interactivas sin GPU dedicada ni conexion de red.
- Servidores sin GPU: la variante GGUF Q4_K_M funciona en CPU con llama.cpp, util para runners de CI modestos.
- Generacion de changelogs preliminares: agrupar asuntos generados por modulo o directorio para redactar notas de version de forma semiautomatica.
- Formacion y onboarding: mostrar a desarrolladores junior ejemplos de asuntos especificos derivados de sus propios diffs.

## Benchmarks y rendimiento

Evaluacion sobre 450 commits de test de django-rest-framework, pydantic y sphinx (proyectos no vistos en entrenamiento). Referencia: el asunto escrito por el autor. Artefactos publicados (MLX 4-bit, greedy, guarded). Intervalos bootstrap al 95%.

| Sistema | ROUGE-L | Especifico % | Generico % | Nombres no en diff % | Bien formado % | Palabras |
|---|---:|---:|---:|---:|---:|---:|
| Qwen2.5-Coder-1.5B-Instruct, solo prompt | 21.09 [19.43, 22.76] | 92.44 [90.0, 94.89] | 0.0 [0.0, 0.0] | 0.44 [0.0, 1.11] | 92.22 [89.56, 94.67] | 7.18 [6.98, 7.38] |
| v1: QLoRA en MLX, 2400 ejemplos | 31.06 [28.89, 33.2] | 80.67 [77.11, 84.22] | 6.22 [4.0, 8.67] | 0.44 [0.0, 1.11] | 98.89 [97.78, 99.78] | 4.71 [4.54, 4.89] |
| SFT-v2: LoRA, una epoca | 30.16 [27.97, 32.39] | 79.33 [75.56, 82.89] | 8.44 [6.0, 11.11] | 1.11 [0.22, 2.22] | 100.0 [100.0, 100.0] | 4.42 [4.28, 4.58] |
| Este modelo: SFT-v2 + DPO (beta 0.3) | 31.13 [29.06, 33.2] | 95.56 [93.56, 97.33] | 0.0 [0.0, 0.0] | 1.56 [0.44, 2.89] | 100.0 [100.0, 100.0] | 6.28 [6.1, 6.46] |

DPO frente a SFT-v2, emparejado sobre los mismos diffs: especifico +16.22 [12.67, 19.78] puntos, generico -8.44 [-11.11, -6.0], ROUGE-L +0.97 [-0.79, 2.75], nombres no en el diff +0.44 [-0.67, 1.78], longitud +1.85 [1.66, 2.04] palabras.

Juez LLM (Claude Haiku 5.5, por pares, ambos ordenes; veredicto dividido cuenta como empate):

| Comparacion | Juez | Victorias / derrotas / empates | Tasa de victoria, sin empates |
|---|---|---|---|
| Este modelo vs SFT-v2 | rubrica v1 | 268 / 54 / 128 | 83.2% [78.8, 86.9] |
| Este modelo vs SFT-v2 | rubrica v2 (neutral en longitud) | 291 / 48 / 111 | 85.8% [81.7, 89.2] |
| Este modelo vs v1 | rubrica v1 | 267 / 74 / 109 | 78.3% [73.6, 82.3] |

Cuantizacion: MLX 4-bit genera el mismo asunto que fp16 solo en el 19.56% [16.0, 23.11] de los diffs con decodificacion greedy (las casi-igualdades cambian el resultado), pero la calidad no cae: ROUGE-L frente a fp16 difiere en 1.29 [0.05, 2.55] puntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1.54B parametros, la variante MLX 4-bit ocupa aproximadamente 0.8-1 GB de pesos y la GGUF Q4_K_M un tamano similar (el repo completo pesa 1.9 GB).
- GPU recomendadas: no requiere GPU dedicada. En Apple Silicon se usa MLX; en el resto, llama.cpp sobre CPU.
- Cabe en GPU consumer: si, cualquier GPU con 2-3 GB de VRAM libre puede alojar la variante cuantizada, aunque el diseno apunta a ejecucion local sin GPU.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp (CPU, formato GGUF), CLI `commit-suggestor` con extras `[mlx]` o `[cpu]`, hook de git.
- Latencia: el hook impone un limite de 8 segundos por sugerencia; no se publican cifras de throughput ni de latencia media. El entrenamiento DPO de las tres betas tardo 2.1 h en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Commit Suggestor (v2) | 1.54B | no disponible | Asunto de commit desde diff | Apache 2.0 | Hugging Face (MLX, GGUF) |
| Qwen2.5-Coder-1.5B-Instruct | 1.54B | no disponible en esta ficha | Generacion de codigo general | Apache 2.0 | Hugging Face |
| v1 (QLoRA en MLX) | 1.54B | no disponible | Asunto de commit desde diff | no disponible | Referenciado en la model card, no publicado como repo independiente |

El modelo base sin ajuste obtiene ROUGE-L 21.09 y 92.22% de asuntos bien formados, frente a 31.13 y 100% del modelo ajustado. La v1 logra 31.06 de ROUGE-L pero solo 80.67% de asuntos especificos y 6.22% de genericos. No se dispone de datos de otros modelos especializados en generacion de mensajes de commit en la informacion proporcionada.

## Limitaciones y advertencias

- Solo genera asuntos en ingles; no se documenta soporte de castellano ni de otros idiomas.
- El prompt esta fijado en `commit_suggestor/prompt.py` (version 2, sin contexto de repositorio); usarlo de otra forma evalua un prompt para el que no fue entrenado.
- El juez LLM y el anotador humano solo coinciden moderadamente (kappa de Cohen 0.232), por debajo del 0.6 objetivo; las tasas de victoria deben leerse como senal ruidosa.
- La metrica de especificidad es una regla basada en heuristicas (`commit_suggestor/metrics.py`) que fallo una validacion contra valoraciones humanas en v1; tratarla como proxy.
- Tasa de nombres inventados no presentes en el diff: 1.56% [0.44, 2.89] en el modelo publicado, superior a la de SFT-v2 (1.11%).
- La cuantizacion MLX 4-bit cambia el asunto respecto a fp16 en el 80.44% de los diffs con decodificacion greedy, aunque la calidad media no se degrada.
- El contexto de repositorio se entreno pero no se publica; no debe asumirse su disponibilidad.
- Entrenado solo con commits de proyectos Python; el rendimiento en otros lenguajes o ecosistemas no esta validado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct tiene sus propios terminos que conviene revisar.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nihar-damera/commit-suggestor
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio GitHub (codigo, pipeline de datos y evaluacion): https://github.com/nihardamera/Commit-Suggestor
- Data card: https://github.com/nihardamera/Commit-Suggestor/blob/main/docs/DATA_CARD.md
