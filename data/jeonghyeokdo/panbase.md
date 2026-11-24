# JeonghyeokDo/PanBase

## Resumen

PanBase es un método de *pansharpening* (fusion de imagenes) para teledeteccion desarrollado por el grupo KAIST-VICLab (repositorio publicado por JeonghyeokDo). El pansharpening consiste en combinar una imagen pancromatica de alta resolucion espacial con imagenes multiespectrales de menor resolucion para obtener una imagen multiespectral de alta resolucion. La aportacion central de PanBase es sustituir el punto de partida interpolado (LRMS) que usan habitualmente las redes de pansharpening por una estimacion fisica calibrada y consistente con la observacion, denotada **s**, calculada sin red neuronal.

El modelo se formula como `x̂ = s + f_φ(x_pan, x_ms, s)`: la estimacion fisica **s** actua simultaneamente como base del residuo global y como entrada adicional de la red. El repositorio no contiene una arquitectura unica, sino los coeficientes PanBase y 129 checkpoints correspondientes a 15 *backbones* distintos, cada uno en su version original y en dos variantes PanBase (s_pan y s_ms), entrenados sobre WorldView-3, QuickBird y GaoFen-2.

Es relevante ahora porque aborda un problema estructural del pansharpening con aprendizaje profundo (la dependencia de un punto de partida interpolado fisicamente inconsistente) mediante un componente determinista y sin red, aplicable como *plug-in* sobre arquitecturas existentes. El repositorio ocupa 31,5 GB y esta publicado bajo licencia mixta (tag `other`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples backbones de pansharpening (15) con base fisica PanBase; no es una arquitectura unica |
| Parametros totales | no disponible (depende de cada backbone; 129 checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | Mixta: CC BY-NC-SA 4.0 mas terminos de cada repositorio upstream (tag `other`) |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

PanBase no define una red propia, sino un marco de *plug-in*. Para cada backbone se entrena la version original y dos variantes PanBase: una con la base fisica derivada de la imagen pancromatica (s_pan) y otra derivada de la multiespectral (s_ms). La formulacion `x̂ = s + f_φ(x_pan, x_ms, s)` introduce **s** como residuo base y como entrada adicional de la red, de modo que la red aprende a corregir una estimacion fisica en lugar de partir de una interpolacion. Los coeficientes PanBase se proporcionan para WorldView-3, QuickBird y GaoFen-2, con dos geometrias cada uno; WorldView-2 se evalua en modo *zero-shot* reutilizando los coeficientes de WorldView-3.

Cada backbone se entrena con su receta publicada; la version original y las dos variantes PanBase usan la misma receta y el mismo presupuesto de iteraciones, y el checkpoint se selecciona por PSNR de validacion. Los datos de entrenamiento son PanCollection (WorldView-3, QuickBird, GaoFen-2); el repositorio no redistribuye imagenes. El codigo de los backbones no se almacena en el Hub: `scripts/fetch_repos.sh` descarga cada repositorio upstream en un commit fijado y aplica un parche. Seis combinaciones no tienen checkpoint entrenado (BNNPan s_ms en WV3, QB y GF2; U-Know-DiffPAN s_ms en GF2; MMMamba s_ms en QB y GF2).

## Capacidades

- Fusion de imagenes multiespectrales y pancromaticas (pansharpening) de imagenes de satelite.
- Procesamiento de imagenes de WorldView-3, QuickBird y GaoFen-2; evaluacion *zero-shot* en WorldView-2 con coeficientes de WorldView-3.
- Integracion como *plug-in* sobre 15 backbones de pansharpening distintos, en tres variantes (original, s_pan, s_ms).
- Calculo de la base fisica **s** sin red neuronal (componente determinista).
- Tarea de imagen a imagen (`image-to-image`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo *thinking*, vision general, audio ni generacion de texto.

## Casos de uso

- Pansharpening de imagenes WorldView-3 en produccion: se aplica PanBase con un backbone adecuado para obtener imagenes multiespectrales de alta resolucion a partir de pares pancromatico/multiespectral, usando los coeficientes WV3 incluidos.
- Procesamiento de imagenes QuickBird y GaoFen-2: el repositorio incluye coeficientes y checkpoints especificos para ambos sensores, lo que permite desplegar el metodo sin recalibrar la base fisica.
- Evaluacion comparativa de backbones: los 129 checkpoints y los valores de tabla en `MODEL_ZOO.md` permiten comparar el efecto de PanBase frente a la version original sobre una misma receta e iteraciones.
- Generalizacion a sensores no vistos: WorldView-2 se evalua *zero-shot* con coeficientes WV3, util para escenarios con sensores no cubiertos directamente.
- Investigacion en fusion de imagenes: la base fisica **s** sin red sirve como componente reproducible para estudiar el efecto del punto de partida en redes de pansharpening.
- Integracion en pipelines de teledeteccion existentes: al ser un *plug-in*, puede incorporarse sobre backbones ya desplegados sin reemplazar la arquitectura, mediante los scripts `make_bases.py` e `infer.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los valores de tabla de cada checkpoint estan en `MODEL_ZOO.md` del repositorio de codigo, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del backbone concreto; el repositorio completo ocupa 31,5 GB, pero cada checkpoint individual es un subconjunto).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante los scripts del repositorio (`scripts/infer.py`), con pesos en safetensors y `config.json` por checkpoint. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de pansharpening que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia mixta: los coeficientes y checkpoints PanBase son CC BY-NC-SA 4.0 (no comercial) **mas** los terminos de cada repositorio upstream; es necesario revisar `licenses/<Method>.md` para el metodo concreto que se vaya a usar.
- El tag `other` a nivel de repositorio no sustituye la revision de las licencias individuales.
- El codigo (GitHub) es Apache-2.0 con avisos de terceros en `NOTICE.md`, distinto de la licencia de los pesos.
- Los datos de entrenamiento (PanCollection) no tienen declaracion de licencia; las imagenes son de Maxar / CRESDA, lo que puede afectar a la redistribucion o al uso comercial de resultados derivados.
- Seis combinaciones backbone/variante no tienen checkpoint entrenado.
- El codigo de los backbones no esta en el Hub: requiere descargar repositorios upstream en commits fijados y aplicar parches, lo que anade complejidad de reproducibilidad.
- Evaluacion en WorldView-2 solo *zero-shot* con coeficientes WV3, sin entrenamiento especifico.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible verificar el rendimiento de forma independiente.
- No aplica a tareas de lenguaje, agentes o tool calling; su uso esta restringido a fusion de imagenes de teledeteccion.

## Enlaces

- Hugging Face: https://huggingface.co/JeonghyeokDo/PanBase
- Codigo: https://github.com/KAIST-VICLab/PanBase
- Pagina del proyecto: https://kaist-viclab.github.io/PanBase_site/
- Valores de tabla de checkpoints: https://github.com/KAIST-VICLab/PanBase/blob/main/MODEL_ZOO.md
- Paper: proximamente (no disponible)
