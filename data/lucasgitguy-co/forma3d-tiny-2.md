# Lucasgitguy-co/forma3d-tiny-2

## Resumen

Forma3D Tiny 2 es un modelo de investigacion de tipo image-to-3D desarrollado por Lucasgitguy-co. Se trata de un prototipo de muy reducido tamano (306.321 parametros) que convierte una imagen de entrada en una representacion de nube de Gaussianas 3D, materializada como fichero PLY. Es un fine-tune continuado del modelo previo Forma3D Tiny, entrenado con un optimizador reiniciado desde cero y sobre una rejilla de 16 al cubo con anchura 64.

El modelo no es un generador de mallas ni un sistema de reconstruccion 3D de proposito general: su objetivo es aprender una correspondencia entre renders ortograficos de objetos centrados sobre fondo negro y muestras de superficie comprimidas a una Gaussiana por celda de rejilla ocupada. No emplea profesor 3D preentrenado ni renderizado diferenciable, y el autor lo etiqueta explicitamente como prototipo de investigacion.

Su relevancia es acotada pero clara para quien trabaja en pipelines ligeros de image-to-3D: documenta de forma transparente el proceso de continuacion de entrenamiento, los criterios de seleccion de checkpoint y las puertas de evaluacion, con artefactos de auditoria (training.json, metrics.jsonl, evaluation.json, data-audit.json). El checkpoint publicado corresponde al paso 7800 de 8000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de red neuronal para image-to-Gaussian; rejilla 16^3, anchura 64) |
| Parametros totales | 306.321 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada visual, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (model.pt); salida en PLY de Gaussianas |

## Arquitectura y entrenamiento

El modelo mantiene la misma arquitectura que Forma3D Tiny, sin condicionamiento por prompt de texto ni decodificador de malla nuevo. Trabaja sobre una rejilla volumetrica de 16 al cubo con anchura de canales 64, y produce una Gaussiana por celda de rejilla ocupada como representacion de la superficie. La entrada son renders ortograficos de nubes de Gaussianas proxy derivadas de mallas, centradas sobre fondo negro; la salida es una nube de Gaussianas en formato PLY.

El entrenamiento parte del checkpoint de Forma3D Tiny en la revision e80b8d895cc2e405894473abe4ce40b3472eaca7, con optimizador reiniciado. Se completaron 8000 pasos y se selecciono el paso 7800. Los datos provienen de allenai/objaverse y scenario-labs/3d-collection, con exclusion de los identificadores de assets, grupos de origen conocidos y hashes de malla exactos de los 96 assets conocidos de la v1; el autor advierte que pueden permanecer duplicados cercanos. La particion de test es del 15 por ciento por grupos de objetos y no participa en la seleccion de checkpoint; el 20 por ciento de los grupos de desarrollo se reserva para validacion. No se ejecuto ningun profesor 3D preentrenado ni se realizo entrenamiento con fotografias naturales o renderizado diferenciable.

## Capacidades

- Conversion image-to-3D: genera una nube de Gaussianas 3D (PLY) a partir de una imagen de entrada.
- Funcionamiento especifico sobre renders ortograficos de objetos centrados sobre fondo negro.
- Representacion de salida basada en gaussian splatting, con una Gaussiana por celda de rejilla ocupada.
- Supervision mediante mesh proxy: los objetivos de entrenamiento derivan de muestras de superficie de mallas.
- Inferencia en dispositivo configurable (el ejemplo de la model card usa `--device mps`).
- Utilidad de previsualizacion incluida (`image3d preview`) para renderizar el PLY resultante.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No soporta condicionamiento por texto ni decodificacion de malla.

## Casos de uso

- Prototipado rapido de pipelines image-to-3D: sirve como componente minimo (306.321 parametros) para validar una cadena completa de captura de imagen, inferencia y exportacion a PLY antes de invertir en modelos mayores.
- Investigacion sobre gaussian splatting con supervision proxy: util para experimentos controlados donde se necesita un modelo pequeno, reproducible y con artefactos de auditoria completos.
- Generacion de assets 3D de baja fidelidad para pruebas de herramientas: los PLY resultantes pueden alimentar visores, conversores o validadores de formato sin requerir calidad de produccion.
- Benchmarking de infraestructura de inferencia: su tamano reducido permite medir latencia y consumo en dispositivos variados (CPU, MPS, GPU) con un coste minimo.
- Docencia y divulgacion: ejemplo didactico de entrenamiento por continuacion, seleccion de checkpoint y evaluacion con particiones por grupos de objetos.
- Validacion de procesos de curaduria de datos 3D: el modelo documenta exclusion de assets, auditoria de duplicados y particiones, lo que lo hace util como referencia metodologica en proyectos de datasets 3D.
- Previsualizacion de objetos centrados en flujos de catalogacion: dado un render ortografico de un objeto aislado sobre negro, generar una representacion volumetrica aproximada para inspeccion rapida.

## Benchmarks y rendimiento

Los unicos datos publicados comparan el checkpoint inicial (Forma3D Tiny) con el seleccionado (Forma3D Tiny 2) sobre los mismos datos proxy reservados:

| Metrica | Forma3D Tiny (inicio) | Forma3D Tiny 2 (seleccionado) |
|---|---:|---:|
| Perdida media de test | 0.616513 | 0.570490 |
| IoU medio de ocupacion de vista (umbral 0.5) | 0.286327 | 0.327870 |

Grupos de test: 36; vistas: 156. Las metricas son promediadas por vista sobre renders proxy. El autor indica explicitamente que no establecen fotorrealismo, calidad de imagenes en vistas novedosas, calidad de malla, fidelidad de textura, jugabilidad ni reconstruccion 3D de proposito general. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 306.321 parametros el modelo es extremadamente ligero y cabe con holgura en cualquier GPU consumer.
- GPU recomendadas: no disponibles en la informacion; el ejemplo oficial usa `--device mps`, lo que indica soporte para Apple Silicon. Por tamano, cualquier GPU con unos pocos cientos de MB libres deberia ser suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: el paquete propio `image3d` (comandos `generate` y `preview`), instalado con Python 3.11 y `uv pip install ".[data]"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Forma3D Tiny 2 | 306.321 | Gaussianas PLY | Imagen ortografica de objeto centrado sobre negro | Apache 2.0 | Hugging Face (repo de 0.0 GB) |
| Forma3D Tiny (base) | no disponible | Gaussianas PLY | Igual que Tiny 2 | Apache 2.0 | Hugging Face |
| Otros modelos image-to-3D de proposito general | no disponible | Malla/textura/Gaussianas | Imagen o texto | variable | variable |

No se dispone de datos de benchmarks comparables con otros modelos image-to-3D en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo etiqueta como prototipo; no esta pensado para produccion.
- Entrada restringida: espera renders ortograficos de objetos centrados sobre fondo negro; no se ha entrenado con fotografias naturales.
- Sin garantia de calidad 3D: las metricas publicadas no establecen fotorrealismo, calidad de vistas novedosas, calidad de malla ni fidelidad de textura.
- Sin decodificador de malla: la salida es una nube de Gaussianas, no una malla texturizada.
- Sin condicionamiento por texto: no acepta prompts textuales.
- Riesgo de duplicados en datos: el autor advierte que pueden permanecer duplicados cercanos pese a la exclusion de assets conocidos de la v1.
- Sesgos: no documentados; al entrenarse sobre Objaverse y 3d-collection, hereda la distribucion de esos datasets (no disponible el detalle de composicion).
- Licencia Apache 2.0 para codigo y pesos, con obligacion de conservar NOTICE, THIRD_PARTY.md y ATTRIBUTIONS.json; los assets de Scenario (CC BY) y Objaverse (CC0) mantienen sus propios registros de atribucion y licencia en DATASETS.md.
- Sin datos de cuantizacion ni de despliegue en servidores de inferencia estandar; el uso previsto es mediante el paquete `image3d`.
- Idiomas: no aplica, pero conviene senalar que no procesa texto en ninguna lengua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/forma3d-tiny-2
- Modelo base: https://huggingface.co/Lucasgitguy-co/forma3d-tiny
- Dataset Objaverse: https://huggingface.co/datasets/allenai/objaverse
- Dataset 3D Collection: https://huggingface.co/datasets/scenario-labs/3d-collection
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
