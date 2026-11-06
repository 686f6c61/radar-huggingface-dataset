# cleversonledur/qwen2.5-1.5b-instruct-nondestructive

## Resumen

Qwen2.5-1.5B-Instruct-nondestructive es una variante modificada de Qwen/Qwen2.5-1.5B-Instruct, publicada por el usuario cleversonledur, que elimina de los pesos la direccion interna asociada a la tendencia a ejecutar comandos destructivos cuando el modelo actua como agente con acceso a shell. El problema que aborda es concreto: al dar a un modelo pequeno acceso a herramientas como `run_shell` y una instruccion vaga ("limpia esto"), el modelo base tiende a tomar atajos peligrosos como `rm -rf`, `git reset --hard` o `terraform destroy`. Segun la model card, en 40 tareas donde un comando destructivo era un atajo tentador, el modelo base lo ejecuto en el 35 % de los casos, mientras que esta variante no lo hizo en ninguno.

La intervencion no implica reentrenamiento ni filtros externos: se aplica una ablacion direccional sobre los pesos existentes, de modo que la arquitectura, el tamano, la plantilla de chat y el formato de tool calling permanecen identicos a los del modelo base. Con 1.777.088.000 parametros reales (1,5B nominales) y aproximadamente 3,6 GB en bfloat16, el modelo esta pensado para ejecutarse en local, incluso en GPU de portatil, y para integrarse en cualquier entorno donde funcione el modelo base.

La relevancia actual es doble: por un lado, demuestra que es posible modificar el comportamiento de seguridad de un modelo pequeno mediante edicion de pesos en lugar de RLHF o filtros; por otro, expone el compromiso resultante, ya que la ablacion tambien reduce la tasa de exito en peticiones de borrado explicitas (del 80 % al 50 %) y en tareas vagas con llamada a herramienta (del 88 % al 50 %). Es, por tanto, un experimento reproducible y documentado sobre control de comportamiento en agentes, no un modelo de proposito general mejorado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no se publican en la model card; al ser compatible con transformers y del mismo tamano que el base, son aplicables las cuantizaciones habituales del ecosistema (no confirmado por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-1.5B-Instruct original: un transformer decoder-only con atencion causal, sin mezcla de expertos ni mecanismos hibridos. La unica diferencia respecto al base es la edicion de pesos mediante ablacion direccional, una tecnica inspirada en la abliteration descrita por Arditi et al. (2024) para eliminar rechazos. No hay reentrenamiento, fine-tuning supervisado ni RLHF/DPO adicional: los pesos se modifican directamente.

El procedimiento, documentado en el repositorio del autor, consta de cuatro pasos. Primero, se ejecuta el modelo base sobre 48 tareas destructivas y 48 tareas seguras equivalentes (por ejemplo, "borra todos los .log" frente a "lista todos los .log"). Segundo, en cada capa se calcula la media de los estados ocultos en el ultimo token del prompt para cada grupo y se resta la media segura de la destructiva, normalizando el resultado a longitud 1; esa es la direccion destructiva `r`. Tercero, se evalua la direccion de cada capa y se conserva la mejor: la capa 20 a intensidad completa. Cuarto, se editan todas las matrices que escriben en el estado oculto (el embedding, cada `o_proj` de atencion y cada `down_proj` del MLP) con la formula `W - outer(r, r @ W)`, de modo que el modelo ya no puede escribir a lo largo de `r`. El resultado es determinista en generacion greedy y no depende de un filtro en tiempo de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Tool calling y function calling con el formato de Qwen2.5, validado en la model card con la herramienta `run_shell`.
- Uso como agente de shell: planifica y emite llamadas a herramientas para tareas de administracion de sistemas, con preferencia por comandos de inspeccion (`du`, `git status`, `git log`, `whoami`) frente a comandos destructivos.
- Razonamiento multi-paso dentro de una misma respuesta: en el ejemplo de la model card, primero razona sobre la conveniencia de comprobar el tamano de un directorio y despues emite la llamada correspondiente.
- Capacidades de codigo y matematicas heredadas del base, aunque no se documentan evaluaciones especificas en esta variante.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agentes de shell con permisos amplios: el modelo puede recibir acceso a una maquina Linux y ejecutar tareas de mantenimiento con menor probabilidad de comandos irreversibles. Es adecuado porque la direccion destructiva ha sido eliminada de los pesos, no solo filtrada en la salida, y mantiene el mismo formato de tool call que el base.
- Automatizacion de limpieza de directorios en entornos de staging: ante instrucciones vagas como "prepara esta carpeta para el lanzamiento", el modelo tiende a inspeccionar primero (`du -sh`) en lugar de borrar, lo que permite revisar la accion antes de aplicarla.
- Gestion de repositorios git en pipelines: para tareas como "deja el repo en estado limpio", el modelo ejecuta primero `git status` o `git log`, lo que reduce el riesgo de perder cambios locales con `git reset --hard` o `git clean -fd`.
- Prototipado de agentes en portatil: con 1,5B parametros y unos 3,5 GB en bfloat16, cabe en GPU de consumo y permite iterar sobre disenos de agentes sin coste de API, usando transformers con `device_map="auto"`.
- Investigacion sobre control de comportamiento: sirve como caso reproducible para estudiar ablacion direccional, comparar con el modelo base y medir el compromiso entre seguridad y utilidad en agentes pequenos.
- Evaluacion de infraestructura como codigo: en escenarios con Terraform, el modelo evita `terraform destroy -auto-approve` ante instrucciones ambiguas y prefiere comandos de diagnostico, lo que encaja en flujos donde un humano revisa el plan antes de aplicar.
- Entornos educativos y demos de seguridad en IA: permite mostrar en vivo la diferencia entre un modelo base y una variante ablacionada con las mismas entradas y generacion greedy, sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion propia del autor sobre tareas de agente con shell, generacion greedy y la herramienta `run_shell`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Llamadas destructivas en 40 tareas que no las piden (menor es mejor) | 0,35 | 0,00 |
| Peticiones de borrado explicitas completadas, de 20 (mayor es mejor) | 0,80 | 0,50 |
| Tareas ordinarias con llamada a herramienta, de 20 (mayor es mejor) | 1,00 | 1,00 |
| Tareas vagas en las que el modelo hizo alguna llamada a herramienta | 0,88 | 0,50 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB de pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto y lote.
- En cuantizacion de 8 bits, la huella de pesos baja a unos 1,8 GB; en 4 bits, a alrededor de 1 GB, aunque el autor no publica versiones cuantizadas ni cifras oficiales.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para bfloat16; para despliegue en servidor, A100 o H100 no son necesarias por tamano, pero permiten mayor throughput con lotes grandes.
- Cabe en GPU de portatil de gama media-alta y en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers (metodo documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles; no se confirma soporte explicito de vLLM, llama.cpp u Ollama en la informacion disponible, aunque al compartir arquitectura con el base son plausibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento en tareas destructivas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cleversonledur/qwen2.5-1.5b-instruct-nondestructive | 1,777B | no disponible | 0,00 en 40 tareas (evaluacion del autor) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B nominales | no disponible en la informacion | 0,35 en las mismas 40 tareas | apache-2.0 | Hugging Face, ampliamente usado |
| Otras variantes ablacionadas de Qwen2.5 | no disponible | no disponible | no disponible | variable | no disponible |

La comparacion directa solo es posible con el modelo base, ya que el autor no compara con otras variantes ablacionadas ni con modelos de seguridad especificos. Frente al base, la diferencia medible esta en la tasa de comandos destructivos (0,35 a 0,00) a costa de menor tasa de exito en borrados explicitos (0,80 a 0,50) y en tareas vagas con llamada a herramienta (0,88 a 0,50).

## Limitaciones y advertencias

- La ablacion reduce la utilidad en peticiones legitimas de borrado: solo completa el 50 % de las peticiones explicitas de borrado, frente al 80 % del base, por lo que no es adecuado para tareas donde eliminar archivos sea el objetivo principal.
- En tareas vagas, la tasa de llamada a herramienta cae del 88 % al 50 %: el modelo puede quedarse en modo de inspeccion y no completar la tarea solicitada.
- La evaluacion es propia del autor, con 40 tareas destructivas, 20 peticiones de borrado y 20 tareas ordinarias, generacion greedy y una unica herramienta; no hay validacion independiente ni intervalos de confianza publicados.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y sesgos heredados del Qwen2.5-1.5B-Instruct original, no evaluados en esta variante.
- La edicion de pesos no sustituye a controles de seguridad en produccion: un agente con acceso a shell sigue necesitando sandbox, permisos minimos y revision humana de comandos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de terceros.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado.
- La fecha de creacion del repositorio (2026-11-05) es posterior a la del modelo base y no se acompana de una publicacion o peer review del metodo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cleversonledur/qwen2.5-1.5b-instruct-nondestructive
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del metodo (codigo, datos y explicacion): https://github.com/cleversonledur/llm-destructive-command-removal
- Paper de referencia sobre abliteration: https://arxiv.org/abs/2406.11717
