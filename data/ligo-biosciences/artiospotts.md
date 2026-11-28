# Ligo-Biosciences/ArtiosPotts

## Resumen

ArtiosPotts es un modelo de diseño de secuencias de proteínas condicionado por la estructura tridimensional del esqueleto proteico y por los ligandos presentes en el complejo. Lo desarrolla Ligo Biosciences y forma parte de la suite Artios, un conjunto de herramientas para el diseño de enzimas de novo que combina difusión all-atom con modelos de Potts "steerable". El modelo resuelve el problema de asignar secuencias de aminoácidos compatibles con una geometría dada, teniendo en cuenta el entorno químico que aportan los ligandos, algo relevante para el diseño de sitios activos enzimáticos.

Técnicamente es un modelo compacto: un codificador MPNN (message passing neural network) procesa la estructura y los ligandos, y predice los campos y acoplamientos de un modelo de Potts, del que posteriormente se muestrean secuencias. Los pesos publicados corresponden a una EMA tras 38.400 actualizaciones de entrenamiento y suman 2,6 millones de parámetros, un tamaño muy reducido que refleja su especialización en una tarea concreta más que en generación de texto general.

Su relevancia radica en el contexto: el diseño computacional de enzimas funcionales es un cuello de botella en biotecnología, y Artios propone un enfoque modular donde la difusión genera esqueletos y ArtiosPotts propone secuencias condicionadas por ligando. La licencia Apache 2.0 y la integración en un paquete Python (`artios`) facilitan su adopción, aunque el modelo es un componente de un pipeline mayor y no un sistema autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNN (message passing neural network) que predice campos y acoplamientos de un modelo de Potts |
| Parametros totales | 2,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada estructurada de proteína + ligando) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); fichero `38400_ema_0.9999.pt` |

## Arquitectura y entrenamiento

ArtiosPotts emplea un codificador MPNN que recibe la estructura del esqueleto proteico junto con los ligandos y produce los parámetros de un modelo de Potts (campos y acoplamientos). A partir de esa distribución se muestrean secuencias de aminoácidos compatibles con la geometría y el entorno químico del complejo. El enfoque de Potts permite además un control "steerable" sobre el muestreo, según se describe en el artículo asociado. El modelo se apoya en Protenix (ByteDance) como base, tal como se indica en el NOTICE del repositorio.

Los pesos publicados corresponden a una media exponencial móvil (EMA con decaimiento 0,9999) tras 38.400 actualizaciones de entrenamiento. El repositorio incluye un `training_config.yaml` de referencia, pero la model card no detalla el número de tokens, la composición del dataset ni si se aplicaron etapas de RLHF/DPO (conceptos que, por otra parte, no aplican directamente a este tipo de modelo). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal, ajenas al dominio.

## Capacidades

- Diseño de secuencias de proteínas condicionado por estructura tridimensional del esqueleto.
- Incorporación explícita de ligandos en el codificador, lo que permite condicionar el diseño al entorno químico del sitio de unión.
- Muestreo de secuencias a partir de un modelo de Potts con parámetros predichos por la red.
- Puntuación de diseños existentes mediante energía de Potts (`artios score`).
- Soporte de residuos fijos, selección de cadenas y ajustes de muestreo a través de la CLI y la API de Python.
- Integración en un pipeline de diseño de enzimas de novo junto con difusión all-atom (suite Artios).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo específico de biología estructural.

## Casos de uso

- Diseño de sitios activos enzimáticos: dado un esqueleto con un ligando (sustrato o cofactor) colocado en el sitio de unión, ArtiosPotts propone secuencias que acomodan ese ligando, lo que permite explorar variantes de enzimas de novo con un entorno químico definido.
- Rediseño de secuencias sobre esqueletos generados por difusión: en el flujo Artios, la difusión produce esqueletos all-atom y ArtiosPotts asigna secuencias compatibles, cerrando el ciclo de diseño computacional.
- Puntuación y filtrado de librerías de diseños: el comando `artios score` calcula la energía de Potts de secuencias candidatas, útil para priorizar experimentalmente un subconjunto antes de la validación en laboratorio.
- Diseño condicionado por ligando en proyectos de biocatálisis: al incorporar el ligando en el codificador, el modelo es adecuado para entornos donde la identidad y posición del sustrato condicionan la secuencia del sitio activo.
- Exploración de variantes con residuos fijos: la opción de fijar residuos permite mantener motivos catalíticos o posiciones estructurales críticas mientras se rediseña el resto de la secuencia.
- Prototipado rápido en investigación académica: con 2,6 M de parámetros y licencia Apache 2.0, se puede ejecutar en hardware modesto y modificar para experimentos metodológicos.
- Generación de candidatos para validación experimental: los diseños sirven como hipótesis computacionales que deben validarse in vitro; el modelo no garantiza plegamiento, unión ni actividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,6 M de parámetros los pesos ocupan del orden de decenas de MB en precisión completa (el repositorio tiene 0,0 GB según Hugging Face).
- GPU recomendadas: cualquier GPU con suficiente memoria para la estructura de entrada y el grafo molecular; una RTX 4090 o incluso GPUs de gama media son más que suficientes. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en cualquier GPU consumer moderna e incluso podría ejecutarse en CPU para casos puntuales, aunque el cuello de botella será el preprocesado estructural y la construcción del grafo.
- Opciones de despliegue: paquete `artios` (instalable con `uv tool install artios` o `pip install artios`), que descarga los pesos en el primer uso. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArtiosPotts | 2,6 M | no aplica | Diseño de secuencias condicionado por estructura y ligando | Apache 2.0 | Hugging Face + paquete `artios` |
| ProteinMPNN | no disponible en la información | no aplica | Diseño de secuencias sobre esqueleto (sin ligando explícito) | MIT (según fuente original, no verificada aquí) | Código abierto |
| LigandMPNN | no disponible en la información | no aplica | Diseño de secuencias condicionado por ligando | no disponible | Código abierto |

La comparativa con ProteinMPNN y LigandMPNN es pertinente por categoría (diseño de secuencias sobre estructura), pero los datos concretos de parámetros, contexto y rendimiento de esas alternativas no se han proporcionado en la información disponible y no deben darse por verificados.

## Limitaciones y advertencias

- Los diseños son candidatos para validación computacional y experimental: una energía de Potts baja no demuestra que la proteína se pliegue, una o sea activa, tal como advierte el autor.
- El modelo no genera texto ni mantiene conversaciones; no debe evaluarse con métricas de LLM (MMLU, HumanEval, etc.).
- No se documentan sesgos, pero al ser un modelo entrenado sobre estructuras biológicas puede heredar los sesgos de la composición del dataset de entrenamiento (no detallada).
- Riesgo de alucinación en sentido figurado: puede proponer secuencias plausibles según el Potts que no sean viables termodinámicamente; se requiere filtrado con predictores de plegamiento y docking.
- Limitaciones de contexto o idioma: no aplica en el sentido habitual; la limitación real es la calidad y resolución de la estructura de entrada y la correcta parametrización del ligando.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar el NOTICE relativo a Protenix y citar el artículo de Artios.
- Dependencia de un pipeline mayor: ArtiosPotts es un componente de la suite Artios; su uso aislado requiere construir el preprocesado estructural.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación aún incipiente.

## Enlaces

- Hugging Face: https://huggingface.co/Ligo-Biosciences/ArtiosPotts
- Repositorio Artios: https://github.com/Ligo-Biosciences/artios
- README de Artios: https://github.com/Ligo-Biosciences/artios#readme
- Artículo (paper): https://papers.ligo.bio/artios
- Ligo Biosciences: https://ligo.bio
- Protenix (base): https://github.com/bytedance/Protenix
