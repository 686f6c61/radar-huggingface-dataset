# SallySims/pyramiddiff-wpp2024

## Resumen

PyramidDiff (WPP 2024) es un modelo de difusión condicional de tamano reducido (una UNet 1D de aproximadamente 7,3 millones de parametros) desarrollado por el usuario SallySims. Modela la estructura de poblacion por edad simple y sexo: cada piramide de poblacion se representa como un array de dimensiones (2 x 101) que contiene las proporciones de poblacion para las edades de 0 a 100+. El modelo no genera texto ni codigo, sino distribuciones demograficas plausibles condicionadas a un resumen de indicadores (edad mediana, porcentaje de menores de 15 anos, porcentaje de mayores de 65, ratio de sexos y ano).

El problema que aborda es el del *age heaping* o preferencia de digito en los datos demograficos (redondeo de edades a multiplos de 0 y 5), un fenomeno habitual en censos y encuestas que distorsiona las piramides de poblacion. PyramidDiff permite reparar ese sesgo, rellenar edades faltantes (*inpainting*) y detectar piramides implausibles a partir del error de denoising. Se entrena con datos de World Population Prospects 2024 de Naciones Unidas, cubriendo paises y areas entre 1950 y 2023, con un split por pais de 80/10/10.

Es relevante ahora porque ofrece una alternativa basada en aprendizaje profundo a los metodos clasicos de suavizado demografico, con la ventaja de producir incertidumbre mediante muestreo. No obstante, en los datos publicados por el autor su variante por defecto no supera al mejor metodo clasico en paises no vistos (0,103 frente a 0,102 por mil), por lo que debe considerarse un prototipo de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet 1D de difusion condicional |
| Parametros totales | 7.284.738 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 x 101 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una UNet 1D adaptada a difusion condicional, con aproximadamente 7,3 millones de parametros. La entrada es una piramide de poblacion de dimensiones (2 x 101): dos sexos por 101 grupos de edad (0 a 100+), expresada como proporciones de poblacion. El condicionamiento se realiza sobre un vector de resumen demografico compuesto por edad mediana, porcentaje de poblacion menor de 15 anos, porcentaje de poblacion mayor de 65 anos, ratio de sexos y ano. El modelo aprende a generar muestras de piramides condicionadas a ese resumen, lo que permite cuantificar la incertidumbre mediante muestreo multiple.

El entrenamiento utiliza los datos de World Population Prospects 2024 (variante Medium) de Naciones Unidas, con poblacion por edad simple y sexo para paises y areas entre 1950 y 2023. El split es por pais: 80 % entrenamiento, 10 % validacion y 10 % test. Tambien se emplearon las proyecciones 2024-2100, pero solo para paises de entrenamiento; validacion y test son puramente historicos. Es importante senalar que las piramides de WPP son estimaciones modeladas, no recuentos censales brutos. La innovacion tecnica principal es el esquema de reparacion de *age heaping*: se parte de una interpolacion PCHIP que preserva los totales por ventanas de 5 anos, se anade ruido parcial y se denoisa con el modelo reimponiendo en cada paso los totales observados de las ventanas centradas en los digitos con heaping, de modo que el modelo solo decide la forma dentro de cada ventana.

## Capacidades

- Generacion de piramides de poblacion plausibles a partir de condiciones de resumen (edad mediana, % menores de 15, % mayores de 65, ratio de sexos y ano), con incertidumbre basada en muestreo.
- Reparacion de *age heaping* (preferencia de digito en 0 y 5) mediante un esquema de ruido parcial y denoising con proyeccion por paso sobre los totales de ventanas de 5 anos.
- *Inpainting* de edades faltantes en una piramide de poblacion.
- Deteccion de piramides implausibles mediante la puntuacion de error de denoising (AUROC de 1,000 frente a heaping simulado).
- Modelado conjunto por sexo (dos canales) y por edad simple (101 grupos).
- Condicionamiento temporal mediante la variable ano.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingues; es un modelo numerico especializado.

## Casos de uso

- Reparacion de datos censales con heaping: dado un censo con redondeo de edades a multiplos de 5, aplicar el pipeline PCHIP mas denoising con proyeccion por paso para recuperar una distribucion por edad simple coherente con los totales observados por ventanas de 5 anos.
- Validacion de calidad de encuestas: usar la puntuacion de error de denoising como indicador de implausibilidad para marcar piramides sospechosas antes de incorporarlas a un sistema estadistico.
- Imputacion de edades faltantes: en registros con edades no declaradas, el *inpainting* del modelo rellena los grupos de edad ausentes manteniendo la coherencia global de la piramide.
- Generacion de escenarios sinteticos para docencia o simulacion: muestrear piramides condicionadas a un resumen demografico concreto (por ejemplo, edad mediana 20, 42 % menores de 15, ano 2005) para probar algoritmos de analisis demografico.
- Analisis de incertidumbre: generar multiples muestras para una misma condicion y estudiar la dispersion de las piramides resultantes, algo que los metodos clasicos de suavizado no ofrecen de forma nativa.
- Investigacion metodologica en demografia computacional: servir de base o linea base para comparar tecnicas de difusion frente a metodos clasicos (media movil de 5 puntos, interpolacion PCHIP) en tareas de suavizado y reparacion.

## Benchmarks y rendimiento

Evaluacion sobre paises de test no vistos (1702 piramides; el heaping es simulado). Error absoluto medio de las proporciones por edad simple, en por mil de la poblacion total (menor es mejor):

| Metodo | MAE (por mil) |
|---|---|
| Entrada con heaping (sin reparacion) | 1,687 |
| Media movil de 5 puntos + proyeccion por ventana (clasico) | 0,128 |
| Interpolacion PCHIP con totales por ventana (clasico) | 0,102 |
| PyramidDiff, inicio en entrada bruta, una proyeccion final | 0,134 |
| PyramidDiff, inicio en entrada bruta, proyeccion por paso | 0,108 |
| PyramidDiff, inicio PCHIP, proyeccion por paso (por defecto) | 0,103 |

Indice de Whipple medio: verdad 100, con heaping 193, PCHIP 100, PyramidDiff por defecto 100. AUROC de la puntuacion de anomalia (limpio frente a heaping simulado): 1,000. En paises no vistos, la variante por defecto de PyramidDiff no mejora al mejor metodo clasico (0,103 frente a 0,102 por mil).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 7,3 millones de parametros en precision completa (fp32) los pesos ocupan aproximadamente 29 MB, y el coste dominante es el bucle de denoising, no el modelo.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU de gama media ejecutarian la inferencia sin problemas.
- Cabe en GPU de consumo y tambien en CPU para lotes pequenos.
- Opciones de despliegue: inferencia directa con PyTorch cargando `pyramiddiff.py` desde el repositorio de Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos de difusion comparables en la informacion proporcionada. La comparacion relevante es frente a metodos clasicos de reparacion de heaping, recogida en la tabla de benchmarks:

| Alternativa | Tipo | MAE en test (por mil) | Licencia |
|---|---|---|---|
| PyramidDiff (por defecto) | Difusion condicional | 0,103 | MIT |
| PCHIP con totales por ventana | Interpolacion clasica | 0,102 | no aplica |
| Media movil de 5 puntos + proyeccion | Suavizado clasico | 0,128 | no aplica |

## Limitaciones y advertencias

- El heaping se evaluo contra un proceso sintetico; el heaping real de encuestas difiere y varia por pais, sexo y edad.
- Entrenado sobre estimaciones modeladas y suaves de WPP, por lo que infrarepresenta irregularidades reales (choques migratorios, guerras, poblaciones pequenas).
- La reparacion asume que el heaping desplaza personas como maximo 2 anos; no corrige errores grandes de declaracion de edad ni omision selectiva por sexo.
- En paises no vistos no supera al mejor metodo clasico (0,103 frente a 0,102 por mil), por lo que su ventaja practica no esta demostrada fuera de la distribucion de entrenamiento.
- Es un prototipo de investigacion; no debe usarse para estadisticas oficiales ni para decisiones a nivel individual.
- Licencia MIT para el modelo, pero los datos de WPP 2024 de Naciones Unidas tienen sus propias condiciones de uso que deben revisarse antes de reutilizarlos.
- Riesgo de alucinacion en sentido demografico: puede generar piramides plausibles pero no observadas; las muestras no son datos reales.
- No disponible informacion sobre sesgos por region, idioma (no aplica) o cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SallySims/pyramiddiff-wpp2024
- Dataset de entrenamiento: https://huggingface.co/datasets/SallySims/wpp2024-single-age-pyramids
- World Population Prospects 2024 (Naciones Unidas): https://population.un.org/wpp/
