# lark-anon-27/click-count-objective-code

## Resumen

`lark-anon-27/click-count-objective-code` no es un modelo de lenguaje, sino un repositorio de artefactos de investigacion: codigo, protocolo pre-registrado y resultados de ejecucion asociados a un paper sobre el aprendizaje de clics en titulares a partir de recuentos de impresiones y clics. El autor, bajo el alias anonimo `lark-anon-27`, lo publica como material suplementario anonimizado, presumiblemente para un proceso de revision por pares ciego.

El repositorio contiene scripts de entrenamiento, evaluacion y generacion de tablas (comentarios en coreano, comandos en `README_en.txt`), ficheros de resultados leidos por las tablas del paper, el protocolo pre-registrado con enmiendas fechadas y pares de titulares derivados del Upworthy Research Archive (CC BY 4.0, Matias et al. 2021). Tambien enlaza dos adaptadores LoRA publicados por separado sobre Qwen3-8B, que son los unicos artefactos con pesos de modelo reales.

Por tanto, este repositorio no debe evaluarse como un modelo desplegable: no contiene pesos, no declara licencia propia y su tamano es de 0.0 GB. Su relevancia es metodologica (reproducibilidad de un estudio sobre objetivos de clic) y como punto de entrada a los adaptadores LoRA enlazados, no como componente de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de codigo y resultados, no de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (comentarios de codigo en coreano; documentacion parcial en ingles) |
| Licencia | no disponible para el repositorio; los datos Upworthy son CC BY 4.0; los adaptadores enlazados se declaran CC BY 4.0 |
| Formato de pesos | no aplica (no contiene pesos); los adaptadores enlazados son LoRA sobre Qwen3-8B |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de modelo propia. Contiene el pipeline experimental del paper: scripts de entrenamiento, evaluacion y generacion de tablas, junto con el protocolo pre-registrado (`00_plan/prereg.txt`, original en coreano, con resumen en ingles en `prereg_summary_en.txt`) y sus enmiendas fechadas. Los datos de entrenamiento derivados son pares de titulares (`data/pairs_*.jsonl`) construidos a partir del Upworthy Research Archive.

Los unicos artefactos con pesos son dos adaptadores LoRA sobre Qwen3-8B, publicados en repositorios separados: `upworthy-count-objective-qwen3-8b-lora` y `upworthy-suh-kl-qwen3-8b-lora`. El repositorio no incluye los ficheros crudos de Upworthy, MIND, MicroLens, KuaiRand ni Open Bandit, ni la cache de respuestas del LLM, ni adaptadores entrenados sobre MIND o MicroLens, por restricciones de licencia de redistribucion. La reproducibilidad declarada cubre los numeros ejecutables en CPU mediante `bash scripts/reproduce_cpu.sh`, que termina con `REPRO_OK`.

## Capacidades

- Reproduccion de resultados en CPU mediante `scripts/reproduce_cpu.sh`, con verificacion explicita (`REPRO_OK`).
- Generacion de tablas y metricas del paper a partir de los ficheros en `results/`.
- Entrenamiento y evaluacion de objetivos de clic sobre pares de titulares (scripts en `scripts/`).
- Documentacion del protocolo pre-registrado con enmiendas fechadas, para auditoria metodologica.
- Distribucion de adaptadores LoRA sobre Qwen3-8B en repositorios enlazados, con model cards y `score.py`.
- No incluye inferencia de un modelo base, tool calling, agentes, vision ni audio.

## Casos de uso

- Auditoria metodologica de un estudio sobre objetivos de clic: el protocolo pre-registrado y sus enmiendas fechadas permiten verificar que las decisiones de diseno se tomaron antes de ver los resultados, lo que es util en revision por pares y en replicaciones.
- Replicacion de resultados en CPU: `scripts/reproduce_cpu.sh` permite regenerar los numeros del paper sin GPU, adecuado para entornos de revision con recursos limitados.
- Reutilizacion de los pares de titulares de Upworthy: `data/pairs_*.jsonl` sirve como base para experimentos propios de modelado de clics, respetando la atribucion CC BY 4.0 del archivo original.
- Evaluacion de adaptadores LoRA sobre Qwen3-8B: los repositorios enlazados incluyen `score.py` y model cards, lo que facilita puntuar titulares con los adaptadores en un pipeline propio.
- Docencia en metodologia experimental: el conjunto de codigo, protocolo y resultados commitados es un ejemplo completo de estructura reproducible para cursos de NLP aplicado.
- Base para estudios de sesgo en objetivos de clic: el propio autor advierte que "clicks are not reader benefit", lo que hace del repositorio un punto de partida para analizar la diferencia entre metrica de engagement y utilidad para el lector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene ficheros de resultados del paper en `results/`, pero no se proporcionan sus valores numericos en la informacion facilitada.

## Requisitos de hardware

- El repositorio en si no requiere GPU: los numeros reproducibles se ejecutan en CPU via `scripts/reproduce_cpu.sh`.
- Los adaptadores LoRA enlazados requieren cargar Qwen3-8B como base; no se dispone de estimaciones de VRAM en la informacion proporcionada.
- Opciones de despliegue para los adaptadores: no disponible (no se especifican vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada repositorios comparables de artefactos de investigacion sobre objetivos de clic con estructura equivalente (protocolo pre-registrado, resultados commitados y adaptadores LoRA publicados por separado).

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos, no declara licencia y su tamano es de 0.0 GB.
- El autor indica explicitamente "Research use only"; no hay autorizacion de uso comercial declarada para el repositorio.
- Los ficheros crudos de Upworthy, MIND, MicroLens, KuaiRand y Open Bandit no se incluyen por restricciones de licencia; los resultados de esos datasets solo contienen identificadores de item y puntuaciones.
- Los adaptadores entrenados sobre MIND y MicroLens no se distribuyen por reserva de licencia.
- El codigo tiene comentarios en coreano y documentacion parcial en ingles; no se declaran idiomas soportados.
- Advertencia explicita del autor: los clics no equivalen a beneficio para el lector, por lo que optimizar esta metrica puede introducir sesgos de engagement.
- Alias anonimo y fechas de creacion/actualizacion en 2026: la identidad del autor y el estado de revision del paper no son verificables con la informacion disponible.

## Enlaces

- Repositorio: https://huggingface.co/lark-anon-27/click-count-objective-code
- Adaptador LoRA (objetivo de recuento): https://huggingface.co/lark-anon-27/upworthy-count-objective-qwen3-8b-lora
- Adaptador LoRA (SUH-KL): https://huggingface.co/lark-anon-27/upworthy-suh-kl-qwen3-8b-lora
- Upworthy Research Archive (CC BY 4.0, Matias et al. 2021): https://osf.io/jd64p
