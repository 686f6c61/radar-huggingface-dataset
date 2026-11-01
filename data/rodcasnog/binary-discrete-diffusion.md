# rodcasnog/binary-discrete-diffusion

## Resumen

Binary Discrete Diffusion es una familia de modelos de lenguaje basados en difusion discreta para texto, desarrollada por Rodrigo Casado Noguerales junto con Dimitri von Rütte, Bernhard Schölkopf, Thomas Hofmann y Aran Raoufi, y publicada en el articulo arXiv 2610.28543. El repositorio de HuggingFace contiene un diffusion transformer por cada combinacion de corpus y kernel de ruido, entrenados con el codigo del proyecto binary-discrete-diffusion en JAX/Flax. El modelo aborda la generacion de texto mediante difusion sobre tokens discretos en lugar de decodificacion autorregresiva, con el objetivo declarado de mejorar tareas de logica y planificacion.

El repositorio incluye tres corpus (Text8 a nivel de caracter, TinyStories y OpenWebText con tokenizadores BPE de 1k) y cuatro kernels de ruido (masked, uniform, binary_symmetric y binary_absorbing), lo que da hasta doce directorios de ejecucion independientes. Cada directorio contiene la configuracion compuesta de Hydra y los parametros EMA del paso final del entrenamiento. El tamano total del repositorio es de 6.0 GB, lo que sugiere modelos de escala moderada, aunque la model card no desglosa el numero de parametros por checkpoint.

La relevancia de esta publicacion radica en su enfoque experimental sobre difusion discreta con kernels binarios, un area menos explorada que la difusion continua o los modelos autorregresivos. No obstante, se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin pipeline definido y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (difusion discreta sobre tokens) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (checkpoints en `checkpoints_ema/<step>/`, framework JAX/Flax) |

## Arquitectura y entrenamiento

La arquitectura es un diffusion transformer adaptado a difusion discreta, implementado en JAX con Flax. El modelo se entrena con distintos kernels de ruido: `masked`, `uniform`, `binary_symmetric` y `binary_absorbing`. Cada combinacion de corpus y kernel constituye una ejecucion independiente configurada mediante archivos YAML en `configs/paper/<corpus>/<kernel>.yaml`, con la configuracion compuesta guardada en `.hydra/config.yaml` y los parametros EMA del paso final en `checkpoints_ema/<step>/`.

Los datos de entrenamiento son tres corpus publicos: Text8 (tokenizado a nivel de caracter mediante `scripts/prep_text8.py`), TinyStories (con el tokenizador BPE `rodcasnog/tinystories-bpe-1k`) y OpenWebText (con `dvruette/openwebtext-bpe-1k`). Los pasos finales de checkpoint son 1.000.000 para Text8, 500.000 para TinyStories y 250.000 para OpenWebText. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El muestreo se realiza con parametros configurables como `sampler.nfe` (numero de evaluaciones de funcion), `sampler.spacing` (log), `sampler.eta` y `sampler.lam`, lo que indica un esquema de muestreo tipo ODE/SDE con control de pasos.

## Capacidades

- Generacion de texto mediante difusion discreta no autorregresiva sobre tokens.
- Cuatro variantes de kernel de ruido que permiten estudiar distintos comportamientos de difusion.
- Modelado a nivel de caracter (Text8) y a nivel de subpalabra con BPE de 1k (TinyStories, OpenWebText).
- Generacion condicionada por longitud en el caso de TinyStories (las longitudes se toman de `data/tinystories`).
- Evaluacion de verosimilitud mediante NELBO (negative evidence lower bound) y de calidad mediante MAUVE.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: el articulo menciona tareas de logica y planificacion, pero la model card no documenta capacidades de agente.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion en difusion discreta: el repositorio sirve como referencia reproducible para comparar kernels de ruido (`masked`, `uniform`, `binary_symmetric`, `binary_absorbing`) sobre el mismo corpus, gracias a las configuraciones Hydra y los checkpoints EMA incluidos.
- Experimentos de generacion no autorregresiva: util para estudiar latencia y calidad de muestreo con distinto numero de evaluaciones de funcion (`sampler.nfe`) y esquemas de espaciado logaritmico.
- Modelado a nivel de caracter: la variante Text8 permite experimentos de generacion de texto caracter a caracter, util en docencia y en investigacion sobre tokenizacion.
- Generacion de cuentos cortos: la variante TinyStories, entrenada sobre el corpus homonimo, es adecuada para estudiar generacion de narrativa simple con control de longitud.
- Evaluacion de metricas generativas: el soporte de NELBO y MAUVE en el codigo permite reproducir evaluaciones comparativas entre kernels y corpus.
- Reproduccion de resultados academicos: los checkpoints en pasos concretos (1M, 500k, 250k) permiten replicar los experimentos del articulo arXiv 2610.28543.
- Estudio de planificacion y logica: el titulo del articulo sugiere evaluacion en tareas de logica y planificacion, aunque la model card no detalla los conjuntos de evaluacion especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de NELBO y MAUVE como metricas de evaluacion, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6.0 GB en total, pero al contener multiples checkpoints (hasta doce directorios) el tamano por modelo individual es menor y no se desglosa.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se ejecuta mediante el codigo del repositorio `binary-discrete-diffusion` con `uv run python -m binary_diffusion.sample`, sobre JAX/Flax. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. El muestreo se controla con `sampler.nfe` (por ejemplo, 256 evaluaciones de funcion), lo que condiciona el coste computacional.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de difusion discreta ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes; no hay evidencia de uso en produccion.
- No se documentan sesgos conocidos, pero los corpus de entrenamiento (Text8, TinyStories, OpenWebText) pueden introducir sesgos propios de sus fuentes.
- Riesgo de alucinacion: no evaluado en la informacion disponible; los modelos de difusion discreta de escala moderada suelen producir texto menos coherente que modelos autorregresivos grandes.
- Idiomas soportados no documentados; los corpus son predominantemente en ingles.
- Longitud de contexto no documentada.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks y de documentacion de robustez desaconseja su uso en produccion sin evaluacion previa.
- Requiere clonar el repositorio de codigo y sincronizar dependencias con `uv`; no es un modelo plug-and-play en frameworks estandar.
- El acceso a los tokenizadores y datos auxiliares (`data/text8`, `data/tinystories`) es necesario para el muestreo y la evaluacion.

## Enlaces

- HuggingFace: https://huggingface.co/rodcasnog/binary-discrete-diffusion
- Articulo arXiv: https://arxiv.org/abs/2610.28543
- Repositorio de codigo: https://github.com/rodcasnog/binary-discrete-diffusion
- Tokenizador TinyStories: https://huggingface.co/rodcasnog/tinystories-bpe-1k
- Tokenizador OpenWebText: https://huggingface.co/dvruette/openwebtext-bpe-1k
