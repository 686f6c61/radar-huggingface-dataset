# ForeverBlue/EMG

## Resumen

EMG (sEMG C1) es un codificador transformer preentrenado para senales de electromiografia de superficie (sEMG), desarrollado por el usuario ForeverBlue y publicado bajo licencia Apache 2.0. Resuelve el problema de la escasez de representaciones genericas para bioseries musculares: en lugar de entrenar desde cero para cada montaje de electrodos, ofrece un encoder compartido de 12,1 M de parametros que puede reutilizarse como inicializacion para tareas downstream como clasificacion de gestos, regresion de fuerza o decodificacion de intencion motora. Es relevante porque aplica el paradigma de masked autoencoder, habitual en vision y lenguaje, a senales sEMG heterogeneas.

La innovacion principal es su diseno multi-ruta: un unico transformer compartido atiende tres disposiciones de electrodos distintas (pulseras de muneca, arrays de antebrazo y rejillas de alta densidad) mediante frontends de wavelets especificos por ruta. La identidad del electrodo entra como un embedding aprendido del nombre del canal, no de su indice, lo que facilita la transferencia entre montajes.

El modelo se entreno durante 45 epocas (de 60 configuradas), con validacion registrada hasta la epoca 39, sobre una mezcla de corpus publicos de sEMG. El checkpoint principal publicado corresponde a la epoca 39 y es el usado en los resultados downstream del articulo asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compartido con frontends de wavelets por ruta y doble cabecera de reconstruccion (masked autoencoder) |
| Parametros totales | 12,05 M (10,63 M en el transformer compartido) |
| Parametros activos | no disponible (no es MoE; el nombre "moe" del fichero se refiere a multi-route, no a mixture-of-experts) |
| Longitud de contexto | no disponible (opera sobre ventanas de parches de sEMG; longitud concreta no especificada) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no aplica (modelo de senal bioseries, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch state dict) |

## Arquitectura y entrenamiento

El modelo es un transformer compartido que recibe parches de sEMG procesados por tres frontends de wavelets independientes, uno por cada ruta de electrodos (pulsera, array de antebrazo y rejilla de alta densidad). La identidad del canal se codifica mediante un embedding aprendido del nombre del electrodo, lo que permite al modelo generalizar entre montajes con nombres conocidos. Sobre la representacion del transformer se situan dos cabeceras de reconstruccion simetricas: una predice parches de wavelets plegados y otra predice la forma de onda sEMG preprocesada de los mismos parches enmascarados.

El preentrenamiento sigue un objetivo de masked dual-reconstruction con pesos `0,5*L_spec + 0,5*L_raw + 0,001*L_foldKL`. El enmascaramiento se aplica antes del frontend de wavelets, con ratio 0,7, y el objetivo espectral se normaliza por parche. Se entreno durante 45 epocas sobre una mezcla de corpus publicos de sEMG. En el checkpoint de la epoca 39 (el principal), la validacion reporta: perdida total 0,2580, MSE espectral 0,3207 (NMSE 0,321, Pearson r 0,822), SmoothL1 crudo 0,1953 (NMSE 0,381, Pearson r 0,782) y perdida total macro por ruta 0,2315. El autor advierte que las dos perdidas no son comparables entre si y que las filas macro y ponderadas por muestra pueden divergir si el modelo se especializa hacia los corpus mas pequenos.

## Capacidades

- Extraccion de representaciones auto-supervisadas de sEMG para tareas downstream (clasificacion de gestos, regresion de fuerza, decodificacion motora).
- Reconstruccion de forma de onda sEMG y de coeficientes de wavelets en parches enmascarados.
- Transferencia entre montajes: el transformer compartido, el embedding de nombre de canal y la proyeccion de canal se cargan siempre; los frontends de wavelets y los patchers solo cuando el montaje coincide con una de las tres rutas.
- Manejo de tres disposiciones de electrodos distintas mediante rutas especializadas.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- No incluye modo de razonamiento, vision ni audio.

## Casos de uso

- Clasificacion de gestos con pulseras EMG comerciales: se carga el encoder y se anade una cabeza de clasificacion; el embedding de nombre de canal permite reutilizar el modelo con sensores de distinto fabricante si se mapean los nombres.
- Decodificacion de intencion motora en protesis de mano: se inicializa un modelo de regresion de fuerza o angulo articular con el encoder preentrenado, reduciendo la necesidad de datos etiquetados del usuario.
- Investigacion en interfaces humano-maquina: se emplea como extractor de caracteristicas congelado para comparar tecnicas de clasificacion sobre corpus publicos como NinaPro, dado que el frontend se reconstruye para esos montajes.
- Preentrenamiento continuado: el fichero completo permite reanudar el entrenamiento o adaptar el objetivo de reconstruccion a nuevos corpus sEMG.
- Deteccion de fatiga muscular: las representaciones del encoder pueden alimentar clasificadores de fatiga a partir de ventanas de sEMG de arrays de antebrazo.
- Analisis de alta densidad (HD-sEMG): la ruta de rejilla de alta densidad permite procesar senales de matrices de electrodos para estudios de unidades motoras.
- Benchmark de metodos auto-supervisados en bioseries: los multiples checkpoints (mejor perdida total, mejor macro por ruta, epoca 39, epoca final) permiten estudiar que criterio de validacion transfiere mejor a tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de validacion del propio objetivo de preentrenamiento en la epoca 39:

| Metrica | Valor |
|---|---|
| Perdida total | 0,2580 |
| MSE espectral | 0,3207 |
| NMSE espectral | 0,321 |
| Pearson r espectral | 0,822 |
| SmoothL1 crudo | 0,1953 |
| NMSE crudo | 0,381 |
| Pearson r crudo | 0,782 |
| Perdida total macro por ruta | 0,2315 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (12,05 M de parametros); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 3050, RTX 4090 y similares; tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo (los pesos son `.pth`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al ser un modelo de 12 M de parametros se espera inferencia en milisegundos por ventana en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (encoders sEMG auto-supervisados) con parametros, contexto y licencia documentados para establecer una tabla fiable. Se indica, por tanto, no disponible.

## Limitaciones y advertencias

- Modelo de bioseries: no procesa texto ni lenguaje natural; las filas de idiomas y contexto no aplican.
- El preentrenamiento se detuvo en la epoca 45 de 60 configuradas; la validacion solo se registro hasta la epoca 39, por lo que el checkpoint final no esta validado contra la curva completa.
- Los frontends de wavelets y los patchers solo son compatibles con las tres rutas de entrenamiento; para montajes habituales (NinaPro, anillos de antebrazo) hay que construir un frontend nuevo y los nombres de electrodo pueden quedar fuera del vocabulario.
- El autor advierte que las perdidas espectral y cruda no son comparables entre si; usar solo una de ellas para seleccionar checkpoint puede sesgar la evaluacion.
- Riesgo de sobreajuste a los corpus mas grandes: la validacion ponderada por muestra esta dominada por los corpus de mayor tamano, lo que puede ocultar un mal rendimiento en los pequenos.
- No se documentan sesgos demograficos ni de sujeto; al entrenarse sobre corpus publicos, puede heredar los sesgos de poblacion de esos datasets.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de extrapolacion incorrecta en montajes o condiciones de sensor distintas de las de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ForeverBlue/EMG
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
