# PositivePassion/openfwi-diffusion-priors

## Resumen

OpenFWI Diffusion Priors es una coleccion de seis modelos de difusion preentrenados de caracter incondicional, publicados por el usuario PositivePassion en HuggingFace. No se trata de un modelo de lenguaje, sino de un conjunto de priors generativos pensados para el campo de la inversion de onda completa (full-waveform inversion, FWI) en geofisica, apoyandose en las familias de modelos de velocidad sinteticos del benchmark OpenFWI.

Cada uno de los seis submodelos corresponde a una familia concreta del benchmark (FlatFault A, FlatFault B, CurveFault A, CurveFault B, CurveVel A y CurveVel B) e incluye un `UNet2DModel` de un solo canal junto con un `DDPMScheduler`, todo ello en un formato de directorio compatible con la libreria `diffusers`. Los UNet operan sobre entradas normalizadas de un unico canal con resolucion `72 x 72`, y el flujo de inversion recorta el resultado generado al dominio `70 x 70` propio de OpenFWI.

Su relevancia radica en ofrecer priors generativos listos para usar como regularizacion o inicializacion en pipelines de inversion sismica, evitando tener que entrenar un modelo de difusion desde cero para cada familia de modelos de velocidad. El repositorio ocupa 1,7 GB en total y no registra descargas ni likes en el momento de la consulta. No se dispone de licencia, idiomas ni pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (denoising diffusion probabilistic model) con backbone `UNet2DModel` de un solo canal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion sobre imagenes, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con directorios compatibles con diffusers: `unet` y `scheduler`) |
| Numero de submodelos | 6 (FlatFault-A, FlatFault-B, CurveFault-A, CurveFault-B, CurveVel-A, CurveVel-B) |
| Resolucion de entrada | `72 x 72`, un canal, normalizada |
| Dominio de salida recortado | `70 x 70` (dominio OpenFWI) |
| Tamano del repositorio | 1,7 GB |
| Libreria | diffusers |

## Arquitectura y entrenamiento

La arquitectura se basa en difusion denoising probabilistica (DDPM). Cada familia dispone de un `UNet2DModel` de un unico canal que actua como red de prediccion de ruido, emparejado con un `DDPMScheduler` que define el calendario de difusion. El modelo es incondicional, es decir, no recibe etiquetas ni condicionamiento externo durante la generacion; se limita a muestrear modelos de velocidad plausibles dentro de la distribucion de cada familia OpenFWI.

Los datos de entrenamiento corresponden a las seis familias de modelos de velocidad sinteticos del benchmark OpenFWI (FlatFault A/B, CurveFault A/B, CurveVel A/B). No se especifican en la informacion disponible el numero de tokens, el numero de muestras de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de ajuste como RLHF o DPO (que, por otra parte, no aplican a un modelo de difusion de este tipo). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion incondicional de modelos de velocidad sinteticos de un solo canal en resolucion `72 x 72` (recortables a `70 x 70`).
- Cobertura de seis familias geologicas distintas mediante submodelos independientes: FlatFault A/B, CurveFault A/B y CurveVel A/B.
- Integracion directa con el ecosistema `diffusers` para carga de `UNet2DModel` y `DDPMScheduler`.
- Uso como prior generativo en flujos de inversion de onda completa (FWI), por ejemplo como regularizador o inicializador.
- Muestreo mediante el proceso inverso de difusion propio de DDPM (numero de pasos configurable a traves del scheduler).
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica).
- No dispone de capacidades multilingues ni de procesamiento de lenguaje (no aplica).
- No se declaran capacidades especiales de vision general, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Regularizacion en inversion de onda completa: el prior generativo se emplea para restringir el espacio de soluciones del problema inverso sismico, penalizando modelos de velocidad poco probables segun la familia geologica correspondiente.
- Inicializacion de procesos de FWI: muestrear un modelo de velocidad del prior y usarlo como punto de partida para acelerar la convergencia del optimizador frente a inicializaciones aleatorias o de gradiente suave.
- Generacion de datos sinteticos de aumento: producir modelos de velocidad adicionales de una familia concreta (por ejemplo CurveFault-A) para ampliar el conjunto de entrenamiento de redes de inversion supervisadas.
- Evaluacion de robustez de algoritmos de inversion: comparar como se comporta un solver de FWI ante modelos muestreados del prior frente a modelos reales del benchmark.
- Estudio de incertidumbre: generar multiples muestras del prior para una misma familia y analizar la variabilidad de los modelos de velocidad resultantes.
- Investigacion en difusion aplicada a geofisica: usar los seis submodelos como base para experimentos de condicionamiento (por ejemplo, condicionar a trazas sismicas) o para comparar con otros priors generativos.
- Docencia y prototipado: disponer de un prior ya entrenado y ligero para demostrar flujos de inversion sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (por ejemplo, error de inversion, similitud estructural o comparaciones frente al benchmark OpenFWI), ni datos de latencia o throughput.

## Requisitos de hardware

- El repositorio completo ocupa 1,7 GB, lo que implica un peso medio en torno a unos 280 MB por cada uno de los seis submodelos; el modelo en memoria es, por tanto, de tamano reducido, si bien no se declara el numero de parametros.
- No se dispone de datos oficiales de VRAM, GPU recomendadas, latencia ni throughput en la informacion proporcionada.
- Por el tamano observado del repositorio y el uso de una `UNet2DModel` de un solo canal sobre entradas `72 x 72`, es razonable esperar que la inferencia quepa en GPUs de consumo (RTX 3060, RTX 4090, etc.), aunque este extremo no esta confirmado por el autor.
- No se documentan opciones de despliegue especificas. Al estar empaquetado para `diffusers`, el despliegue se realizaria a traves de la propia libreria `diffusers` (carga de `UNet2DModel` y `DDPMScheduler`).
- Se recomienda descargar unicamente la familia necesaria mediante el parametro `--include` del comando `hf download` para reducir el espacio en disco.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a otros priors de difusion comparables ni datos que permitan una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros modelos generativos aplicados a OpenFWI o a inversion sismica).

## Limitaciones y advertencias

- Modelo incondicional: no acepta condicionamiento externo, por lo que no puede dirigirse la generacion hacia propiedades geologicas concretas mas alla de la familia del submodelo.
- Dominio restringido: solo genera modelos de velocidad sinteticos de las seis familias OpenFWI; no esta pensado para datos reales ni para otras tareas.
- Resolucion limitada: entrada de `72 x 72` recortada a `70 x 70`, lo que restringe el nivel de detalle espacial.
- Sin licencia declarada: la ausencia de licencia explicita impide confirmar las condiciones de uso comercial o de redistribucion; debe aclararse antes de cualquier uso en produccion.
- Sin documentacion de entrenamiento: se desconocen el dataset exacto, el numero de pasos de entrenamiento y los hiperparametros, lo que dificulta la reproducibilidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad de las muestras ni de su utilidad real en pipelines de inversion.
- Sin metricas de sesgo ni de fidelidad: no se documentan sesgos en la distribucion generada ni validacion frente a los modelos de velocidad de referencia.
- Cero descargas y cero likes: el modelo no cuenta con validacion por parte de la comunidad en el momento de la ficha.
- Modelo no linguistico: no procede evaluar sesgos de idioma, alucinaciones de texto ni restricciones tipicas de modelos de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/PositivePassion/openfwi-diffusion-priors
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada. El repositorio incluye un fichero `SHA256SUMS` con las sumas de verificacion de los pesos.
