# Babu09/MEIDNet

## Resumen

MEIDNet (Multimodal Equivariant Inverse Design Network) es un modelo generativo para diseño inverso de materiales cristalinos, desarrollado por Anand Babu junto con R. A. Gouvêa, P. Vandergheynst y G.-M. Rignanese, y publicado en npj Computational Materials (2026). El modelo resuelve un problema concreto: dado un conjunto de propiedades objetivo (banda prohibida directa y entalpía de formación), proponer estructuras cristalinas candidatas que las satisfagan. Para ello alinea, al estilo CLIP, un codificador equivariante de grafos cristalinos y un codificador MLP de propiedades en un único espacio latente de 128 dimensiones.

La arquitectura es un autoencoder dual con fusión temprana (la latente conjunta es la media de las dos latentes) y decodificación consciente de propiedades; no es un transformer ni un modelo de lenguaje, sino una red específica de química computacional de aproximadamente 0,7 millones de parámetros y 2,8 MB por checkpoint. Se publica bajo licencia MIT con el código en GitHub y una aplicación web (MEIDNet Prism) que permite entrenar y ejecutar el flujo desde el navegador.

Su relevancia actual está en el coste: al ejecutarse en CPU de portátil, permite hacer cribado generativo masivo de perovskitas antes de gastar ciclos de DFT. El modelo se entrenó sobre Perov-5 (split de CDVAE, 11.356 estructuras) y reporta una similitud coseno de 0,97 entre las latentes de estructura y propiedad del mismo material, además de una tasa SUN (stable-unique-novel) del 13,6 % (19 de 140 candidatos) en su campaña de diseño inverso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder dual multimodal: codificador equivariante de grafos (estructura) + MLP (propiedades), alineados contrastivamente al estilo CLIP, con fusión temprana y decodificador consciente de propiedades |
| Parametros totales | Aproximadamente 0,7 M (checkpoint de 2,8 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); la entrada estructural admite hasta 20 átomos por celda |
| Tipos de cuantizacion | No disponible (solo se publican pesos PyTorch en precisión de entrenamiento) |
| Idiomas soportados | Inglés (etiqueta de idioma del repositorio `en`); el modelo no procesa texto libre, solo CIF y propiedades escalares |
| Licencia | MIT |
| Formato de pesos | `.pth` (state dict de PyTorch) + ficheros YAML de configuración (`meidnet.yaml`, `perovskite_abx3.yaml`) |
| Espacio latente | 128 dimensiones, compartido entre estructura y propiedades |
| Propiedades de entrada y salida | `dir_gap` (eV, banda prohibida directa) y `heat_all` (eV/atomo, entalpía de formación) |
| Checkpoints publicados | 3: `dual_autoencoder_clip_earlyfusion_propertyaware_2k.pth` (producción, 2000 épocas), `dual_autoencoder_clip_earlyfusion_propertyaware.pth` (entrenamiento más corto), `dual_autoencoder_clip_earlyfusion.pth` (ablación sin decodificación consciente de propiedades) |
| Dataset de entrenamiento | Perov-5, split de CDVAE, 11.356 estructuras de entrenamiento |
| Cribado de estabilidad | Incluido en el paquete: pantalla de estabilidad, unicidad y novedad basada en MACE |
| Tamaño del repositorio | 0,0 GB (los checkpoints son de 2,8 MB cada uno) |
| Descargas y likes en HuggingFace | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

MEIDNet es un autoencoder dual. La rama estructural es un codificador equivariante de grafos que procesa la celda cristalina (entrada en CIF, hasta 20 átomos por celda); la rama de propiedades es un MLP que procesa escalares (`dir_gap`, `heat_all`). Ambas ramas se alinean de forma contrastiva, siguiendo el esquema CLIP, hasta un espacio latente común de 128 dimensiones. La fusión es temprana: la latente conjunta se obtiene promediando las dos latentes, y de ella parten los decodificadores que reconstruyen tanto la estructura como las propiedades. El modelo de producción incorpora además decodificación consciente de propiedades, que es precisamente lo que distingue el checkpoint `_propertyaware_2k` de la ablación `earlyfusion`.

El entrenamiento se realizó sobre Perov-5 (split de CDVAE, 11.356 estructuras), con cobertura de óxidos, nitruros, fluoruros, sulfuros y sus mezclas. El checkpoint de producción se entrenó durante 2000 épocas con un calentamiento contrastivo (contrastive warm-up) en las primeras 1200. No se documenta uso de RLHF ni DPO, algo esperable al no tratarse de un modelo de lenguaje. El flujo de diseño inverso es explícito: se parte de la latente de las propiedades objetivo, se optimiza una población de latentes, cada una se decodifica en un elemento por sitio prototipo, se conservan los candidatos que cumplen todas las reglas químicas y se ordenan por cercanía al objetivo. La familia química se define en un fichero YAML (por ejemplo `perovskite_abx3.yaml`: sitios prototipo de la perovskita cúbica ABX₃, elementos permitidos por sitio, estados de oxidación y reglas). El paquete incluye una pantalla de estabilidad, unicidad y novedad basada en MACE.

## Capacidades

- Diseño inverso de estructuras cristalinas: genera candidatos a partir de propiedades objetivo escalares.
- Predicción directa de propiedades (banda prohibida directa y entalpía de formación) a partir de una estructura, gracias a los decodificadores y al espacio latente compartido.
- Alineación estructura-propiedad en una única latente de 128 dimensiones, lo que permite búsqueda y optimización en ese espacio.
- Aplicación de reglas químicas explícitas: sitios prototipo, elementos permitidos por sitio, estados de oxidación, definidos en YAML.
- Cribado automático de candidatos mediante la pantalla MACE incluida (estabilidad, unicidad, novedad).
- Generación de informes HTML en lenguaje natural con los candidatos propuestos (`meidnet generate`).
- Modo estudio interactivo en navegador (MEIDNet Studio) para entrenar con una tabla propia.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: no es un modelo de propósito general.
- Multilingüismo: no aplica; el repositorio se etiqueta únicamente como `en` y la interacción es mediante API de Python y ficheros de configuración.

## Casos de uso

- Cribado de perovskitas para fotovoltaica: fijando `dir_gap` en el rango de interés para absorción solar (alrededor de 1,3-1,5 eV) y penalizando `heat_all` alto, el modelo propone composiciones ABX₃ candidatas que después se validan con DFT.
- Descubrimiento de materiales con banda prohibida a medida: para aplicaciones de optoelectrónica o fotocatálisis se puede barrer el espacio de propiedades objetivo y generar familias de candidatos en minutos en CPU, reservando el cálculo de alto nivel para las mejores propuestas.
- Generación de candidatos para validación DFT de alto rendimiento: el flujo natural es MEIDNet para proponer, la pantalla MACE para filtrar estabilidad y unicidad, y DFT solo sobre el subconjunto superviviente, lo que reduce el coste computacional del embudo.
- Aumento de datos para otros modelos: los candidatos generados pueden usarse para ampliar conjuntos de entrenamiento de modelos de predicción de propiedades, siempre que se validen antes.
- Exploración de familias químicas alternativas: editando el fichero YAML de familia (sitios prototipo, elementos permitidos, estados de oxidación) se pueden plantear variantes de la perovskita cúbica o restringir el espacio de búsqueda a una química concreta.
- Laboratorios autónomos y self-driving labs: el modelo puede actuar como generador de hipótesis dentro de un bucle cerrado en el que un robot sintetiza y caracteriza los candidatos y los resultados realimentan la siguiente ronda de propuestas.
- Docencia y demostración reproducible: la aplicación MEIDNet Prism y los notebooks de Colab permiten ejecutar el flujo completo, incluido el entrenamiento con una tabla propia, sin instalar nada y en portátil.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos marcados como no verificados en el model-index; los valores se citan del artículo, no de una re-ejecución independiente). Modelo evaluado: MEIDNet Perov-5 (early fusion + curriculum, 2000 épocas).

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| Similitud coseno entre latentes de estructura y propiedad del mismo material | Perov-5 (split CDVAE) | 0,97 | No |
| Distancia L2 entre esas latentes | Perov-5 (split CDVAE) | 0,24 | No |
| Tasa SUN (stable-unique-novel) de candidatos generados | Perov-5 (split CDVAE) | 0,136 (19 de 140) | No |
| MAE | Perov-5 (split CDVAE) | No disponible (la métrica se declara en la model card, pero sin valor) | No |

No se han publicado en la información disponible resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El checkpoint ocupa 2,8 MB y el modelo tiene aproximadamente 0,7 M de parámetros, por lo que el peso de los tensores es despreciable.
- GPU recomendadas: no requiere GPU. Cualquier GPU (RTX 4090, A100, H100) acelera la generación en lote, pero no es necesaria para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso sin GPU. El autor indica explícitamente que se ejecuta en la CPU de un portátil.
- El componente que sí puede beneficiarse de GPU es la pantalla de estabilidad/unicidad/novedad basada en MACE, que se ejecuta aparte del modelo.
- Opciones de despliegue: paquete Python `meidnet` instalado desde GitHub (`pip install git+https://github.com/ABnano/MEIDNet.git`); comandos `meidnet demo`, `meidnet generate`, `meidnet studio`; API `load_checkpoint` / `describe` sobre el checkpoint descargado con `huggingface_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye cifras de modelos comparables. Como referencia de contexto, el split Perov-5 empleado procede de CDVAE, que sería el punto de comparación natural en generación de cristales inorgánicos, así como la pantalla basada en MACE que se usa para filtrar candidatos, pero no se facilitan parámetros, contexto, rendimiento ni licencia de esos sistemas, por lo que no se ofrece tabla comparativa.

## Limitaciones y advertencias

- Los candidatos generados no son materiales confirmados: el propio autor indica que deben confirmarse por DFT o por experimento.
- Sesgo de dominio: la cobertura de elementos sigue a Perov-5 (óxidos, nitruros, fluoruros, sulfuros y sus mezclas). Las predicciones para elementos ausentes del dataset, como Cl, Br, I y la mayoría de los lantánidos, son extrapolaciones, y la herramienta lo advierte explícitamente.
- Alcance estructural limitado: entradas de hasta 20 átomos por celda y una única familia prototipo definida por fichero YAML (la publicada es la perovskita cúbica ABX₃).
- Naturaleza del modelo: no es un modelo de lenguaje ni un modelo de propósito general; no hay generación de texto libre, tool calling, agentes, visión ni audio, a pesar de la etiqueta `multimodal`, que aquí se refiere a estructura más propiedades.
- Fiabilidad de las métricas: los tres valores de benchmark están marcados como no verificados (`verified: false`); se citan del artículo y no de una re-ejecución independiente. La tasa SUN del 13,6 % implica que aproximadamente 6 de cada 7 candidatos no superan el cribado.
- Idiomas: el repositorio se etiqueta únicamente como `en`; la documentación y los informes generados están en inglés.
- Licencia: MIT, permisiva y apta para uso comercial, sin restricciones adicionales documentadas. Aun así, conviene revisar la licencia de los componentes auxiliares (la pantalla MACE) antes de un despliegue comercial.
- Madurez y adopción: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y repositorio de 0,0 GB, lo que sugiere un artefacto recién publicado y sin validación por parte de la comunidad.
- Fechas: el repositorio aparece creado y actualizado el 3 de octubre de 2026, y el artículo está fechado en 2026; verifica la disponibilidad real de los enlaces antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Babu09/MEIDNet
- Artículo en npj Computational Materials: https://doi.org/10.1038/s41524-026-02153-3
- Preprint en arXiv: https://arxiv.org/abs/2601.22009 (referencia arXiv:2601.22009)
- Código fuente (MIT): https://github.com/ABnano/MEIDNet
- Aplicación y estudio en vivo (MEIDNet Prism): https://babu09-meidnet.hf.space/studio/
- Documentación: https://babu09-meidnet.hf.space/docs/
- Página de benchmarks: https://babu09-meidnet.hf.space/docs/benchmarks/index.html
- Notebooks de Colab: https://babu09-meidnet.hf.space/docs/start/colab.html
- Contribuir con resultados propios: https://babu09-meidnet.hf.space/docs/community/contribute.html

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
