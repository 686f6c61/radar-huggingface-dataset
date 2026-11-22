# pyaging/pasta

## Resumen

Pasta es un reloj de envejecimiento transcriptomico para *Homo sapiens* desarrollado por el equipo de pyaging (Salignon et al.), publicado en *Advanced Science* en 2026. No es un modelo de lenguaje: es un clasificador de regresion logistica con regularizacion ridge que opera sobre expresion genica transformada por rangos dentro de cada muestra (*within-sample rank transformation*). Su salida es un desplazamiento de edad relativo (*age shift*) reescalado a un eje de anos humanos, no una prediccion de edad cronologica absoluta.

El modelo aborda un problema concreto en biologia del envejecimiento: disponer de una medida transcriptomica robusta y versatil que capture determinantes quimicos y geneticos del envejecimiento y la rejuvenecimiento en multiples tejidos. Su principal innovacion practica es el preprocesado por rangos intra-muestra, que reduce la sensibilidad a diferencias de normalizacion y plataforma entre estudios, facilitando su aplicacion en cohortes heterogeneas.

Es relevante ahora porque se integra directamente en el ecosistema pyaging, que agrupa decenas de relojes biologicos bajo una API comun (`pya.pred.predict_age(adata, ["pasta"])`), lo que permite compararlo con otros clocks en pipelines de analisis de datos de expresion (AnnData). El repositorio de pesos es minimo (0,0 GB) y la licencia del software es MIT, aunque los pesos conservan los terminos de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con regularizacion ridge (clasificador lineal sobre expresion transformada por rangos) |
| Parametros totales | no disponible (numero de coeficientes no publicado en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; opera sobre un vector de expresion por muestra) |
| Tipos de cuantizacion | no aplica; no se documentan variantes cuantizadas |
| Idiomas soportados | no aplica (entrada biologica, no texto); especie: *Homo sapiens* |
| Licencia | MIT para el software pyaging; los pesos retienen los terminos de los autores originales |
| Formato de pesos | no disponible (formato gestionado por la libreria pyaging; el repo ocupa 0.0 GB) |

## Arquitectura y entrenamiento

Pasta es un clasificador lineal: regresion logistica con penalizacion ridge aplicada sobre un vector de expresion genica previamente transformado mediante *within-sample rank transformation*. Esta transformacion convierte cada perfil de expresion en un vector de rangos relativo a la propia muestra, lo que hace la senal invariante a factores de escala global y reduce el impacto de diferencias de normalizacion entre plataformas y lotes. La salida del clasificador se reescala a un eje de diferencia de edad relativa en anos humanos.

El modelo es multi-tejido y esta disenado para datos de transcriptomica humana. La informacion disponible no detalla el numero de muestras de entrenamiento, la composicion exacta del dataset ni el esquema de validacion; la publicacion asociada (Salignon et al., 2026, *Advanced Science*) es la referencia para esos detalles. No se emplean tecnicas de RLHF, DPO ni decodificacion especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Prediccion de edad transcriptomica en muestras humanas multi-tejido a partir de datos de expresion genica.
- Estimacion de un desplazamiento de edad relativo (*age shift*) en un eje de anos humanos, util para comparar muestras o condiciones entre si.
- Robustez frente a heterogeneidad tecnica gracias a la transformacion por rangos intra-muestra.
- Aplicacion a estudios de determinantes quimicos y geneticos del envejecimiento y de rejuvenecimiento, segun la publicacion asociada.
- Integracion nativa con pyaging y AnnData, lo que permite ejecutarlo junto a otros relojes del catalogo.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Analisis de cohortes transcriptomicas de envejecimiento: aplicar `pya.pred.predict_age(adata, ["pasta"])` sobre un AnnData para obtener un score de edad relativa por muestra y contrastarlo con fenotipos clinicos o cronologicos.
- Estudios de intervencion (farmacologica, dietetica o genetica): comparar el *age shift* entre grupos tratado y control para detectar efectos de rejuvenecimiento o aceleracion del envejecimiento.
- Reprocesamiento de datos publicos heterogeneos: la transformacion por rangos intra-muestra facilita aplicar el reloj a datasets de distintas plataformas sin renormalizaciones especificas por estudio.
- Seleccion y comparacion de relojes: ejecutar Pasta junto a otros clocks de pyaging sobre el mismo AnnData y evaluar concordancia y complementariedad entre predicciones.
- Cribado de hipotesis geneticas: usar el desplazamiento de edad como variable de respuesta en analisis de asociacion sobre modelos celulares o de tejido editados geneticamente.
- Docencia y prototipado en bioinformatica: el modelo es ligero (repo de 0,0 GB) y se ejecuta en CPU, lo que permite incorporarlo a cuadernos de practicas sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo lineal, no requiere GPU; el coste dominante es el preprocesado del AnnData (transformacion por rangos y seleccion de genes).
- VRAM estimada: no aplica en la practica; 0 GB de GPU necesarios.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) solo aportaria ventaja si el pipeline de pyaging paraleliza operaciones sobre matrices grandes.
- Cabe en cualquier equipo consumer; el repositorio de pesos ocupa 0,0 GB.
- Despliegue: mediante la libreria pyaging (`pya.pred.predict_age`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Especie / tejido | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pasta (pyaging/pasta) | Regresion logistica ridge | *Homo sapiens*, multi-tejido | Transcriptomica con rangos intra-muestra | MIT (software); pesos con terminos de los autores | Hugging Face, via pyaging |
| Otros relojes del catalogo pyaging | Diversos (regresion, modelos lineales, etc.) | Variable por reloj | Transcriptomica u otros datos omicos | Variable por reloj | pyaging Clock Catalogue |
| Relojes epigeneticos (p. ej., basados en metilacion) | Regresion penalizada | *Homo sapiens*, tejido especifico | Metilacion de ADN | Variable | Implementaciones publicas |

La informacion disponible no incluye datos cuantitativos de rendimiento que permitan una comparacion numerica con alternativas concretas.

## Limitaciones y advertencias

- La salida no es una edad cronologica absoluta: es un desplazamiento de edad relativo reescalado a anos humanos; interpretarlo como edad del individuo es un error de uso.
- Solo aplica a *Homo sapiens* y a datos de transcriptomica; no es valido para otras especies ni para otros tipos de datos omicos.
- El rendimiento puede degradarse en tejidos o plataformas poco representados en el entrenamiento; la informacion disponible no detalla la cobertura del dataset.
- Riesgo de sobreajuste a las cohortes de entrenamiento y de sesgo por composicion demografica de las muestras; no se documentan analisis de sesgo en la informacion disponible.
- La licencia MIT cubre el software pyaging, no los pesos: los pesos conservan los terminos de los autores originales, por lo que debe verificarse su compatibilidad antes de un uso comercial.
- No se documentan limites de contexto ni de idioma porque no aplican; la unidad de entrada es una muestra biologica.
- Para produccion en entornos regulados (clinicos o farmaceuticos) se requiere validacion independiente; el modelo no esta presentado como dispositivo medico.

## Enlaces

- Hugging Face: https://huggingface.co/pyaging/pasta
- Catalogo de relojes pyaging: https://pyaging.readthedocs.io
- Publicacion: Salignon, J., et al. (2026). Pasta, a versatile transcriptomic clock, maps the chemical and genetic determinants of aging and rejuvenation. *Advanced Science*, e76740. https://doi.org/10.1002/advs.76740
