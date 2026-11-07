# hsafaai/vdc-denoiser-m64-v1

## Resumen

VDC denoiser m64 v1 es un checkpoint preentrenado publicado por el usuario hsafaai (Houman Safaai) en Hugging Face, asociado al articulo del metodo VDC (vine denoising copula). No es un modelo de lenguaje generativo ni un transformer: es un estimador de densidad de copulas bivariadas implementado como denoiser condicional, pensado para ajustar copulas de par en el contexto de la construccion de vine copulas. El repositorio contiene unicamente los pesos preentrenados (`vdc-denoiser-m64-v1.pt`), la configuracion exacta de entrenamiento y metadatos de procedencia del checkpoint.

El modelo trabaja sobre una rejilla finita de 64x64, lo que define su resolucion maxima para representar densidades de dependencia. Se entrena sobre un "copula zoo" sintetico en lugar de datos tabulares crudos, y su uso previsto se limita a la estimacion de densidades de copula bivariada, el ajuste de vine copulas con un estimador de pair-copula preentrenado y la estimacion de informacion mutua y correlacion total. Es relevante por su caracter de checkpoint congelado y reproducible: el autor documenta el paso exacto (190000), la regla de seleccion (`joint_best_standard_plus_complex`), la fecha de congelacion y el hash SHA256, ademas de reconocer defectos conocidos del flujo de entrenamiento original.

La libreria declarada es `custom` y el formato de pesos es PyTorch (`.pt`), no safetensors ni GGUF. El tamano del repositorio es de aproximadamente 0,5 GB. La licencia es MIT. No se dispone de informacion sobre arquitectura interna detallada, numero de parametros ni longitud de contexto en el sentido de modelos de lenguaje, ya que el modelo no opera como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser condicional sobre rejilla 64x64 para estimacion de densidad de copulas (metodo `denoiser_cond_enhanced`); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); rejilla de representacion de 64x64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), mas `manifest.json`, `train_config.yaml` y `model_selection_joint_best.json` |
| Paso del checkpoint | 190000 |
| Regla de seleccion | `joint_best_standard_plus_complex` |
| Fecha de congelacion | 2026-02-13 |
| SHA256 | `8a1b71ad6d2012ed344b22a743a96e667d32a2ab54ade4444686e375e91f5c0f` |
| Tamano del repositorio | ~0,5 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como un `denoiser` con etiqueta de metodo `denoiser_cond_enhanced`, orientado a la estimacion de densidad de copulas bivariadas mediante un enfoque de denoising. No se proporcionan detalles sobre el tipo de red (MLP, CNN u otra), el numero de capas, la dimension de las representaciones ni el esquema de difusion o denoising empleado. La representacion se realiza sobre una rejilla finita de 64x64, lo que acota la resolucion para dependencias casi deterministas.

El entrenamiento se realizo sobre un "copula zoo" sintetico, no sobre datos tabulares crudos de tipo mixto. El autor documenta explicitamente que el flujo de entrenamiento original incluyo desajustes entre sampler y objetivo para las copulas Joe, BB1, BB7 y ejemplos condicionales; el articulo en version camera-ready describe estos defectos y evalua este checkpoint congelado utilizando datos de benchmark corregidos. Los modelos reentrenados que se evaluan en el apendice del articulo no corresponden a este checkpoint. La configuracion exacta de entrenamiento esta incluida en el repositorio como `train_config.yaml`.

## Capacidades

- Estimacion de densidad de copulas bivariadas sobre una rejilla de 64x64.
- Ajuste de vine copulas utilizando el modelo como estimador de pair-copula preentrenado.
- Estimacion de informacion mutua y correlacion total entre variables continuas.
- Uso como componente dentro de pipelines de estimacion de dependencia no parametrica.
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje.
- No dispone de capacidades multilingues.

## Casos de uso

- Analisis de dependencia en datos financieros: el modelo puede emplearse para estimar la densidad de copula entre pares de series de rentabilidades continuas, permitiendo calcular informacion mutua y correlacion total como medidas de dependencia no lineal en carteras.
- Construccion de vine copulas en modelado de riesgo: se usa como estimador de pair-copula preentrenado dentro de un algoritmo de construccion de vine, reduciendo el coste de ajustar cada par de forma independiente en dimensiones moderadas.
- Seleccion de caracteristicas basada en informacion mutua: al estimar densidades bivariadas, permite calcular informacion mutua entre variables continuas para ranking de features en pipelines de machine learning tabular.
- Analisis de redes de dependencia en datos cientificos: aplicable a pares de variables continuas en estudios donde se requiere una medida de asociacion mas alla de la correlacion lineal, como datos de expresion genica o meteorologia.
- Reproduccion de resultados del articulo VDC: el checkpoint congelado y su hash permiten reproducir los resultados principales del paper usando los comandos de evaluacion del proyecto versionado.
- Docencia e investigacion en copulas: util como referencia preentrenada para comparar metodos de estimacion de pair-copulas frente a alternativas parametricas clasicas en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas; unicamente remite al proyecto de experimentos versionado para los comandos de evaluacion y los ajustes numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa aproximadamente 0,5 GB, por lo que los pesos en si caben en cualquier GPU consumer moderna, pero el consumo real de memoria en inferencia depende de la arquitectura interna, que no se documenta.
- GPU recomendadas: no disponibles. Dado el tamano del checkpoint, es probable que quepa en GPUs consumer (por ejemplo, RTX 3060 en adelante), pero no se confirma en la informacion proporcionada.
- Cabe en consumer GPU: presumiblemente si por el tamano del fichero de pesos, aunque no se especifica.
- Opciones de despliegue: el autor proporciona scripts de descarga y ejemplo (`scripts/download_pretrained.py` y `examples/use_pretrained_model.py`) del proyecto `KempnerInstitute/vine-denoising-copula`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / rejilla | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VDC denoiser m64 v1 | Denoiser condicional para copulas | no disponible | Rejilla 64x64 | MIT | Hugging Face (`hsafaai/vdc-denoiser-m64-v1`) |
| Estimadores parametricos clasicos de copula (Gaussian, Clayton, Gumbel, Frank) | Metodos estadisticos | no aplica | no aplica | Variable segun implementacion | Ampliamente disponibles en librerias estadisticas |
| Modelos de copula basados en redes neuronales (por ejemplo, variantes de copula autoencoder) | Redes neuronales para copulas | no disponible | Variable | Variable | Repositorios de investigacion |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite marginales continuas; no esta disenado para datos tabulares de tipo mixto.
- Asume la simplifying assumption propia de las vine copulas, lo que restringe la fidelidad en dependencias condicionales complejas.
- Entrenado sobre un copula zoo sintetico, no sobre datos tabulares crudos, lo que puede limitar la transferencia a distribuciones reales.
- El flujo de entrenamiento original incluyo desajustes sampler-objetivo para Joe, BB1, BB7 y ejemplos condicionales; el autor reconoce estos defectos y evalua el checkpoint con datos de benchmark corregidos.
- La rejilla finita de 64x64 limita la resolucion para dependencias casi deterministas.
- La precision y la calibracion condicional dependen del dataset y del tamano de muestra.
- Este checkpoint es el modelo congelado original de los resultados principales; los modelos reentrenados del apendice no son este checkpoint.
- No se documentan sesgos especificos, pero al ser un modelo estadistico su comportamiento depende de la distribucion de los datos de entrada.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es una estimacion de densidad imprecisa fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del proyecto de experimentos asociado para la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsafaai/vdc-denoiser-m64-v1
- Arbol de ficheros (mirror): https://d6108366.hf-mirror.com/hsafaai/vdc-denoiser-m64-v1/tree/main
- Proyecto de experimentos versionado: https://github.com/KempnerInstitute/vine-denoising-copula/tree/v0.2.5/projects/neurips2026
