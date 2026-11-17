# shreyansh12183/README

## Resumen

El repositorio `shreyansh12183/README` no contiene un modelo de lenguaje, sino una model card de tipo perfil personal publicada en Hugging Face bajo el SDK `static`. El autor, Shreyansh Singh, se presenta como fundador y arquitecto jefe de sistemas de IA de ExperimentLab.in, un laboratorio que se define como "Sovereign Computing Laboratory" y que orienta su trabajo a inteligencia STEM 100 % offline y air-gapped.

La ficha actúa como indice de los proyectos del autor: la estacion de trabajo Vigyan Pro v5.0.7 (publicada en GitHub), el modelo `shreyansh12183/vigyan-3b-quad-master` descrito como una fusion de cuatro dominios mediante DARE-TIES, y el modelo experimental `shreyansh12183/vigyan-125m-158bit-canary` con pesos ternarios nativos en {-1, 0, +1} (formato de 1,58 bits). Tambien incluye un instalador CLI de una linea y enlaces a su organizacion de GitHub y de Hugging Face.

Por tanto, no hay informacion tecnica verificable sobre arquitectura, parametros, contexto, licencia ni datos de entrenamiento del repositorio en si. Cualquier evaluacion del modelo `vigyan-3b-quad-master` o del canario ternario requeriria consultar sus respectivas model cards, que no forman parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una model card de perfil, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos en el repositorio) |

## Arquitectura y entrenamiento

No disponible. El repositorio `shreyansh12183/README` es una pagina estatica (campo `sdk: static` en la cabecera) que funciona como tarjeta de presentacion del autor y como indice de enlaces. No contiene ficheros de pesos, configuracion de modelo, tokenizador ni scripts de entrenamiento.

La unica informacion con relevancia tecnica indirecta son las referencias a otros artefactos del mismo autor: `vigyan-3b-quad-master`, descrito como una fusion de cuatro dominios con la tecnica DARE-TIES (una combinacion de merge por densidad y poda de deltas con TIES merging), y `vigyan-125m-158bit-canary`, descrito como un canario con pesos ternarios nativos en {-1, 0, +1}, es decir, una representacion de 1,58 bits por peso. No se aportan detalles sobre datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- El repositorio en si no expone ninguna capacidad de inferencia: no hay endpoint, pipeline ni pesos.
- Referencia a inteligencia STEM offline y air-gapped a traves de la estacion de trabajo Vigyan Pro v5.0.7.
- Referencia a fusion multi-dominio (cuatro dominios) en `vigyan-3b-quad-master` mediante DARE-TIES.
- Referencia a pesos ternarios nativos en `vigyan-125m-158bit-canary`, orientados a eficiencia extrema en memoria.
- Distribucion mediante instalador CLI de una linea (`curl -fsSL https://experimentlab.in/install.sh | bash`).
- No se documentan tool calling, function calling, agentes, vision, audio, thinking mode ni capacidades multilingues.

## Casos de uso

- Descubrimiento de proyectos del autor: la model card sirve como punto de entrada para localizar los repositorios `vigyan-3b-quad-master`, `vigyan-125m-158bit-canary` y la estacion de trabajo Vigyan Pro en GitHub.
- Evaluacion de tecnicas de fusion de modelos: util como referencia para localizar ejemplos de DARE-TIES aplicados a cuatro dominios, aunque los detalles deben consultarse en la card del modelo correspondiente.
- Estudio de cuantizacion ternaria: el enlace al canario de 1,58 bits permite localizar un experimento con pesos nativos en {-1, 0, +1}, relevante para investigacion sobre eficiencia de memoria.
- Despliegue en entornos air-gapped: la propuesta de estacion de trabajo 100 % offline puede interesar a equipos con requisitos de aislamiento de red, previa validacion del instalador.
- Referencia para documentacion de ecosistema: util para quien quiera mapear la organizacion ExperimentLab y sus repositorios asociados.
- Punto de partida para auditoria de seguridad: el instalador remoto via `curl | bash` es un caso practico para revisar practicas de distribucion de software en proyectos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para este repositorio; el autor menciona un instalador CLI propio (`https://experimentlab.in/install.sh`) y una estacion de trabajo offline, sin detallar motores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No procede una comparativa de modelos: el repositorio es una model card de perfil y no un modelo. Se incluye, a modo de orientacion, la comparacion entre los artefactos que el propio autor referencia.

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shreyansh12183/README` | Model card de perfil (static) | no aplica | no aplica | no disponible | Hugging Face |
| `shreyansh12183/vigyan-3b-quad-master` | Modelo (fusion DARE-TIES, 4 dominios) | 3B (segun el nombre) | no disponible | no disponible | Hugging Face |
| `shreyansh12183/vigyan-125m-158bit-canary` | Modelo ternario experimental (1,58 bits) | 125M (segun el nombre) | no disponible | no disponible | Hugging Face |
| Vigyan Pro v5.0.7 | Estacion de trabajo offline | no aplica | no aplica | no disponible | GitHub |

## Limitaciones y advertencias

- El repositorio no contiene un modelo: no es posible ejecutar inferencia, evaluar calidad ni reproducir resultados a partir de el.
- Ausencia total de licencia declarada, lo que impide determinar si el uso comercial esta permitido.
- No hay informacion sobre sesgos, alucinacion, idiomas ni limitaciones de contexto porque no hay modelo subyacente en este repositorio.
- Los datos de rendimiento y las capacidades de los modelos referenciados (`vigyan-3b-quad-master`, `vigyan-125m-158bit-canary`) no estan verificados en la informacion proporcionada; deben consultarse en sus propias model cards.
- El instalador remoto mediante `curl | bash` implica ejecutar codigo de un dominio externo; conviene auditar el script antes de usarlo en produccion.
- Las fechas de creacion y actualizacion indicadas (noviembre de 2026) deben tratarse con cautela, ya que no se ha podido contrastar su coherencia.
- No se debe citar este repositorio como fuente de especificaciones tecnicas de un modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shreyansh12183/README
- Modelo insignia referenciado: https://huggingface.co/shreyansh12183/vigyan-3b-quad-master
- Canario ternario referenciado: https://huggingface.co/shreyansh12183/vigyan-125m-158bit-canary
- Laboratorio: https://experimentlab.in
- Instalador CLI: https://experimentlab.in/install.sh
- Estacion de trabajo Vigyan Pro: https://github.com/Vigyan-workstation/vigyan-pro
- GitHub del autor: https://github.com/shreyansh001boy-tech
- Organizacion en GitHub: https://github.com/Vigyan-workstation
- Organizacion en Hugging Face: https://huggingface.co/ExperimentLab
- Apoyo a la investigacion: https://buymeachai.in/shreyansh001boy
