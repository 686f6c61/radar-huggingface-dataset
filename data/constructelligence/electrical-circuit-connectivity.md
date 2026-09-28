# constructelligence/electrical-circuit-connectivity

## Resumen

Electrical circuit connectivity (circuits-0.3) es un modelo de segmentación de imagen publicado por Constructelligence en HuggingFace. Su función es leer un plano eléctrico (un escaneo, una foto o el render de una hoja E en PDF) y devolver qué dispositivos pertenecen a qué circuito: receptáculos, interruptores, luminarias, señales de salida y cajas de conexión, junto con los trazados de cableado dibujados entre ellos, qué circuitos tienen home run y una estimación aproximada de la longitud de cableado de cada circuito en la hoja. Está pensado como ayuda al takeoff y a la revisión de planos, no como verificación de cumplimiento normativo ni como as-built.

Técnicamente es un modelo de visión pequeño: CircuitNet es una U-Net convolucional de 1,7 millones de parámetros que recibe imagen en escala de grises y produce tres salidas a stride 2 (mapas de calor de centros por clase ya con NMS 3×3, tamaño de caja en escala logarítmica y una máscara única de cableado). Un script de decodificación posterior (`decode.py`) convierte esas salidas en un grafo de conectividad mediante esqueletonización, resolución de cruces y union-find. Detecta 12 clases de símbolos más la flecha de home run.

Su relevancia es acotada pero concreta: es uno de los pocos modelos abiertos orientados específicamente a conectividad eléctrica en planos, un paso más allá del simple conteo de símbolos, porque resuelve el emparejamiento dispositivo-circuito leyendo el trazado dibujado. El propio autor lo etiqueta explícitamente como modelo "lite", entrenado con planos sintéticos y conjuntos públicos, liberado para investigación y evaluación, y advierte que la precisión en hojas reales es moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (CircuitNet), 1,7 M de parametros, salidas a stride 2 con tres cabezas: `peaks` (13 mapas de calor de centros con NMS 3×3), `size` (tamano de caja en escala log) y `wire` (mascara binaria de cableado) |
| Parametros totales | 1,7 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de vision; entrada de imagen de 512×512 px) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; la model card no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica: modelo de vision; los simbolos y etiquetas de clase estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Pipeline (HuggingFace) | image-segmentation |
| Entrada | Imagen en escala de grises de un plano electrico (escaneo, foto o render de PDF), 512×512 px en los experimentos |
| Salidas | Imagen de circuitos (`circuits.png`) y grafo de conectividad en JSON |
| Clases detectadas | `receptacle`, `gfci_receptacle`, `switch`, `switch_3way`, `ceiling_fixture`, `downlight`, `troffer`, `strip_light`, `exit_sign`, `junction_box`, `panelboard`, `data_outlet`, `homerun_arrow` |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

CircuitNet es una U-Net convolucional de 1,7 M de parámetros que toma entrada en escala de grises y genera salidas a stride 2. La primera cabeza (`peaks`) produce 13 mapas de calor de centros por clase, ya sometidos a NMS 3×3: las 12 clases de símbolos más la flecha de home run. La segunda (`size`) predice el tamaño de caja en escala logarítmica. La tercera (`wire`) es una única máscara de cableado en la que los arcos y las líneas de home run aparecen como líneas centrales continuas, los tramos discontinuos se puentean y se excluyen muros, arcos de puertas, cadenas de cotas y marcas de conductores. El postprocesado (`decode.py`) corta la máscara en cada símbolo para que cada tramo dibujado sea un trazo propio, adelgaza los trazos y construye un grafo de esqueleto; en cada cruce en X empareja las dos continuaciones más rectas, de modo que dos trazados que se cruzan sin punto de conexión quedan como circuitos separados; los extremos de trazo aterrizan en símbolos o en puntas de flecha y un union-find agrupa los dispositivos en circuitos. `data_outlet` y `panelboard` se detectan pero nunca se cablean: los datos son baja tensión y los cuadros se alimentan por home runs.

El entrenamiento combina hojas sintéticas y conjuntos de planos públicos abiertos. Los resultados principales se miden sobre 800 hojas sintéticas de 512×512 reservadas (semillas no usadas en entrenamiento) con degradación de escaneo aplicada (ruido, desenfoque, JPEG, umbralización y contraste desvaído). Existe además un generador sintético v2 más duro (etiquetas de tipo, retículas de techo, nubes y luminarias lineales largas), evaluado sobre 400 hojas reservadas. No se documenta en la model card el número exacto de tokens o imágenes de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO, que en un modelo de segmentación de este tipo no resultan de aplicación.

## Capacidades

- Segmentación y detección de 12 clases de símbolos eléctricos en planos, más la flecha de home run, con NMS 3×3 sobre mapas de calor de centro.
- Detección y esqueletonización de trazados de cableado, incluyendo arcos, líneas de home run y tramos discontinuos puenteados.
- Exclusión explícita de elementos que no son cableado: muros, arcos de puertas, cadenas de cotas y marcas de conductores.
- Resolución de cruces en X: los trazados que se cruzan sin punto de conexión se mantienen como circuitos separados; un par de brazos rectos junto a un símbolo se interpreta como un tramo que pasa de largo.
- Agrupación de dispositivos en circuitos mediante union-find sobre el grafo de esqueleto.
- Detección de home runs (puntas de flecha) y determinación de qué circuitos tienen uno.
- Estimación aproximada de la cantidad de cableado que consume cada circuito en la hoja.
- Salida doble: imagen de circuitos (`circuits.png`) y grafo de conectividad en JSON.
- Inferencia vía ONNX Runtime en Python (`onnxruntime`, `numpy`, `pillow`), con control del tamaño de símbolo mediante el parámetro `--symbol-px` (20 px en el ejemplo).
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni generación de texto. No tiene capacidades multilingües ni modo de pensamiento. Es exclusivamente un modelo de visión para un dominio muy concreto.

## Casos de uso

- Takeoff automatizado de material eléctrico: a partir de la salida JSON, contar receptáculos, interruptores y luminarias por circuito y estimar la longitud de cableado de cada uno para alimentar una hoja de mediciones, evitando el conteo manual sobre el PDF.
- Pre-revisión de planos eléctricos antes de la coordinación: detectar circuitos sin home run, dispositivos huérfanos o agrupaciones de circuito que no cuadran con lo esperado, y marcar esas zonas para revisión humana.
- Digitalización de hojas E rasterizadas: usar el grafo de conectividad como metadato estructurado en un pipeline CAD/BIM que hasta ahora solo tenía imágenes, de modo que los dispositivos queden vinculados por circuito y no solo por posición.
- Indexación y búsqueda de planos: generar, para cada hoja de un repositorio de proyectos, un grafo de conectividad consultable que permita localizar rápidamente en qué plano y en qué circuito está un dispositivo concreto.
- Control de calidad entre versiones de un plano: ejecutar el modelo sobre dos revisiones de la misma hoja y comparar los grafos resultantes para detectar dispositivos añadidos, eliminados o reasignados de circuito.
- Apoyo a la auditoría documental: contrastar el cableado dibujado frente a listados de circuitos o schedules, teniendo presente que el modelo lee lo dibujado y no lo que realmente se construyó.
- Investigación en visión por computador aplicada a documentos técnicos: el modelo y su decodificador sirven como referencia reproducible para estudiar segmentación de símbolos, extracción de topología y resolución de cruces en planos.
- Preprocesado en flujos de cumplimiento o revisiones internas: al ser Apache 2.0, el grafo de conectividad puede integrarse como señal de entrada en herramientas propias, siempre con verificación humana, dado que el modelo no verifica cumplimiento normativo.

## Benchmarks y rendimiento

Resultados sobre 800 hojas sintéticas de 512×512 reservadas, con degradación de escaneo (ruido, desenfoque, JPEG, umbralización y contraste desvaído):

| Metrica | circuits-0.3 | Decoder sobre entradas perfectas | Baseline vecino mas cercano |
|---|---|---|---|
| F1 de trazados de cableado | 0,839 | 0,902 | 0,323 |
| F1 de pares en el mismo circuito | 0,818 | 0,839 | 0,247 |
| Circuitos reproducidos exactamente | 60,3% | 70,7% | 2,3% |
| Home runs encontrados | 90,5% | 95,9% | no disponible |
| F1 de simbolos (todas las clases) | 0,972 | 1,000 | 1,000 |

Deteccion por clase de simbolo (mismas 800 hojas):

| Clase | Cajas GT | Precision | Recall | F1 |
|---|---|---|---|---|
| `receptacle` | 11.000 | 0,958 | 0,999 | 0,978 |
| `gfci_receptacle` | 1.595 | 0,988 | 0,881 | 0,931 |
| `switch` | 2.008 | 0,891 | 0,946 | 0,917 |
| `switch_3way` | 677 | 0,957 | 0,882 | 0,918 |
| `ceiling_fixture` | 884 | 0,977 | 0,846 | 0,907 |
| `downlight` | 4.052 | 0,952 | 0,984 | 0,968 |
| `troffer` | 4.266 | 0,994 | 0,998 | 0,996 |
| `strip_light` | 1.017 | 0,971 | 0,997 | 0,984 |
| `exit_sign` | 963 | 0,991 | 0,994 | 0,992 |
| `junction_box` | 133 | 0,708 | 0,639 | 0,672 |
| `panelboard` | 19 | 1,000 | 0,684 | 0,812 |
| `data_outlet` | 260 | 0,996 | 0,958 | 0,977 |
| `homerun_arrow` | 7.257 | 0,986 | 0,990 | 0,988 |

Resultados sobre hojas E reales reservadas (5 regiones de 4 hojas: Colusa County Admin Office E1.1 y E1.1A mas su mezzanine, y Town of Windsor Highway Garage E101 y E103 a 1/8"=1'-0"; 439 dispositivos cableados y 284 trazados dibujados). La verdad de referencia se extrae de la geometria vectorial de cada PDF:

| Hojas reales, agrupadas | circuits-0.3 | circuits-0.1 (solo sintetico) |
|---|---|---|
| Dispositivos con circuito encontrados | 0,695 | 0,731 |
| F1 de trazados de cableado | 0,519 | 0,343 |
| Precision de trazados de cableado | 0,503 | 0,267 |
| F1 de pares en el mismo circuito | 0,690 | 0,606 |
| Precision de pares en el mismo circuito | 0,659 | 0,604 |
| Home runs encontrados | 0,062 | 0,238 |

Desglose por region:

| Region | Dispositivos GT | Trazados GT | Dispositivos encontrados | F1 trazados | F1 pares | Home runs |
|---|---|---|---|---|---|---|
| `colusa-e11#0` | 112 | 84 | 0,79 | 0,60 | 0,75 | 0,21 |
| `colusa-e11a#0` | 100 | 78 | 0,82 | 0,64 | 0,83 | 0,14 |
| `colusa-e11a#1` | 11 | 5 | 0,82 | 0,33 | 1,00 | 0,00 |
| `windsor-e101#0` | 116 | 75 | 0,68 | 0,43 | 0,30 | 0,00 |
| `windsor-e103#0` | 100 | 42 | 0,47 | 0,29 | 0,90 | 0,00 |

Hojas sinteticas mas duras (generador v2: etiquetas de tipo, retículas de techo, nubes y luminarias lineales largas), 400 reservadas: F1 de trazados 0,804; F1 de pares 0,796; F1 de simbolos 0,952; home runs 87,2%.

## Requisitos de hardware

- Con 1,7 M de parametros, los pesos ocupan aproximadamente 6,8 MB en fp32 (1.700.000 × 4 bytes); la model card no publica cifras oficiales de VRAM ni de memoria.
- La inferencia esta documentada sobre ONNX Runtime en CPU (`pip install onnxruntime numpy pillow`), por lo que no requiere GPU.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.); una GPU solo aporta aceleracion, no es un requisito.
- No se documentan GPU recomendadas (A100, H100 ni equivalentes) porque el modelo no las necesita.
- Opciones de despliegue: ONNX Runtime en Python es lo documentado. Al distribuirse en formato ONNX, es tecnicamente ejecutable con otros runtimes compatibles (ONNX Runtime Web, TensorRT, OpenVINO), pero la model card no ofrece instrucciones ni garantias para ellos.
- El script de inferencia (`predict.py`) acepta `--symbol-px` (20 px en el ejemplo) para ajustar el tamano de simbolo esperado, `--out` para la imagen de circuitos y `--json` para el grafo de conectividad.
- Latencia y throughput: no disponibles. La model card solo publica metricas de calidad, no tiempos de ejecucion ni rendimiento por lote.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos abiertos directamente comparables en la misma categoria (segmentacion de simbolos y extraccion de conectividad electrica en planos). Los unicos puntos de referencia publicados por el autor son su version anterior y un baseline sin lectura de cableado:

| Modelo / referencia | Enfoque | F1 trazados (sintetico) | F1 pares (sintetico) | F1 trazados (real) | Home runs (real) | Licencia |
|---|---|---|---|---|---|---|
| circuits-0.3 | Sintetico + planos publicos, con decodificador de grafo | 0,839 | 0,818 | 0,519 | 0,062 | Apache 2.0 |
| circuits-0.1 | Solo sintetico | no disponible | no disponible | 0,343 | 0,238 | no disponible |
| Baseline vecino mas cercano | Cablea cada dispositivo al mas proximo, sin leer el trazado | 0,323 | 0,247 | no disponible | no disponible | no aplica |

Trabajos relacionados localizados en la busqueda, no comparables directamente por tratarse de propuestas distintas (agentes multimodales para generacion de esquematicos o modelos fundacionales para circuitos VLSI): EEschematic (agente basado en MLLM para generar esquematicos analogicos a partir de netlists SPICE) y la encuesta sobre circuit foundation models. El "Electrical Connectivity Model" de EPE Consulting es un producto propietario de gestion de conectividad de red, sin relacion tecnica con este modelo.

## Limitaciones y advertencias

- El autor la describe explicitamente como "lite": esta entrenada con hojas sinteticas y conjuntos de planos publicos, y se libera para investigacion y evaluacion. Los modelos de produccion de Constructelligence son propietarios.
- Precision moderada en hojas reales y muy dependiente del estilo de dibujo. En las 5 regiones reales de prueba, el F1 de trazados cae a 0,519 y la precision a 0,503, muy por debajo de los 0,839 sinteticos.
- La deteccion de home runs en hojas reales es el punto mas debil: 0,062 agrupado, con 0,00 en tres de las cinco regiones. En sintetico la cifra es 0,905, lo que indica una brecha de dominio importante.
- La clase `junction_box` tiene un F1 bajo incluso en sintetico (0,672, con solo 133 cajas GT), y `panelboard` presenta recall limitado (0,684, con solo 19 cajas GT).
- No es una verificacion de cumplimiento normativo ni un as-built: lee lo que esta dibujado, no lo que se ha construido ni lo que exige la normativa.
- El resultado debe contrastarse siempre con el plano. El propio autor recomienda comprobar la salida real contra el dibujo.
- Riesgo de error en la resolucion de cruces: la heuristica de emparejar las continuaciones mas rectas en una X puede fallar en trazados con geometrias atipicas o poco ortogonales.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias y con la advertencia de que se trata de un modelo de investigacion; conviene validar su comportamiento en el estilo de planos propio antes de integrarlo en produccion.
- No se documentan sesgos, cobertura idiomatica ni comportamiento fuera del dominio de planos electricos; se desconoce como se comporta con simbologia no estadounidense o estilos de rotulacion distintos.
- La ficha de HuggingFace registra 0 descargas y 0 likes, y un tamano de repositorio de 0,0 GB, lo que sugiere una publicacion muy reciente y sin validacion independiente por parte de la comunidad.
- Limitacion de entrada: los experimentos usan imagenes de 512×512 px; no se documenta el comportamiento con hojas completas de gran resolucion sin troceado previo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/constructelligence/electrical-circuit-connectivity
- Sitio del autor (modelos de produccion propietarios): https://constructelligence.co
- Organizacion en GitHub: https://github.com/Constructelligence
- Best AI Tools for Electrical Engineers (2026), Cognitive Future: https://cognitivefuture.ai/best-ai-tools-for-electrical-engineering/
- Connectivity Model, Electric Power Engineers (EPE): https://epeconsulting.com/epe-intelligence/publications/connectivity-model
- A Survey of Circuit Foundation Model: Foundation AI Models for VLSI, arXiv: https://arxiv.org/html/2504.03711v2
- EEschematic: Multimodal-LLM Based AI Agent for Schematic Generation, arXiv: https://arxiv.org/html/2510.17002
