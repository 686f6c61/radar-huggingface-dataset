# BRoss123/LoRetta

## Resumen

LoRetta es un modelo fundacional para *dense image matching* (correspondencia densa de imagenes) en imagenes de teledeteccion, desarrollado por el LEVIR Lab de la Universidad Beihang (Siwei Yu, Han Guo, Zhenwei Shi y Zhengxia Zou). Resuelve el problema del registro geometrico y la geolocalizacion entre pares de imagenes de satelite o aereas capturadas en distintas condiciones temporales, de sensor o de punto de vista, un escenario donde los matchers genericos entrenados con imagenes naturales rinden por debajo de lo necesario.

El modelo sigue un diseno de localizacion-y-registro en dos etapas: un modulo *matchability-aware* estima la region de solape y una transformacion afin previa, y a continuacion un modulo de registro guiado *coarse-to-fine* predice la correspondencia densa residual en el marco ya alineado. Se apoya en un backbone DINOv3 ViT-L/16 incluido de forma local en el paquete, de modo que no descarga codigo ejecutable en tiempo de inferencia.

El checkpoint publicado (`loretta.pth`, 1,29 GB, 807 entradas de state dictionary) es unicamente de inferencia: el dataset LEVIR-GM, el codigo de entrenamiento y el codigo de evaluacion no son publicos todavia. Su relevancia actual reside en que supera a RoMa v2 en el benchmark propio de los autores y reduce la latencia de inferencia, lo que lo convierte en una referencia a considerar para pipelines de registro de imagenes satelitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L/16 (backbone DINOv3) con modulo de matchability y registro denso coarse-to-fine |
| Parametros totales | no disponible (807 entradas en el state dictionary; tamano del fichero 1.294.961.241 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija a 512 x 512 por imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | DINOv3 License (pesos); codigo propio bajo Apache 2.0 |
| Formato de pesos | PyTorch state dictionary (`.pth`, tensor-only) |

## Arquitectura y entrenamiento

LoRetta es un modelo de vision construido sobre un ViT-L/16 de DINOv3, vendorizado localmente con una version fijada de la arquitectura. Sobre ese backbone se anaden dos componentes: un modulo que estima la *matchability* (probabilidad de que un pixel tenga correspondencia valida) junto con una transformacion afin previa que aproxima el solape entre imagenes, y un modulo de registro guiado que opera en el marco alineado y predice un campo de deformacion denso residual mediante un esquema coarse-to-fine. La salida es un *warp field* denso y un mapa de matchability por pixel; opcionalmente se deriva una homografia aplicando RANSAC sobre las correspondencias predichas.

El entrenamiento se realizo con LEVIR-GM, un benchmark de matching optico multitemporal descrito por los autores con 103.000 pares alineados y 827.000 pares aumentados, distribuidos en seis continentes, cinco anos y resoluciones espaciales de 0,5 a 1024 metros. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de vision de este tipo). Tampoco se detalla si se empleo decodificacion especulativa u otras optimizaciones de inferencia; la mejora de latencia frente a RoMa v2 (47,8% menor) se atribuye al diseno del pipeline, no a un mecanismo concreto descrito.

## Capacidades

- Correspondencia densa de imagenes (*dense image matching*) entre pares de imagenes de teledeteccion.
- Estimacion de la region de solape y de una transformacion afin previa mediante el modulo de matchability.
- Prediccion de un campo de deformacion denso residual con resolucion por pixel.
- Generacion de un mapa de matchability por pixel para filtrar correspondencias de baja confianza.
- Estimacion opcional de homografia mediante RANSAC a partir de las correspondencias predichas.
- Registro de imagenes con cambios temporales, de sensor y de punto de vista (cross-view matching).
- Soporte de geolocalizacion de imagenes mediante alineamiento con una referencia geoetiquetada.
- No soporta generacion de texto, codigo, tool calling, agentes ni capacidades linguisticas o multimodales mas alla del par de imagenes.

## Casos de uso

- Registro de imagenes satelitales multitemporales: el modelo alinea pares de imagenes de la misma zona capturadas en fechas distintas, lo que permite comparar cambios en la cobertura del suelo o en infraestructuras tras normalizar la geometria.
- Geolocalizacion de imagenes aereas o de dron: dada una imagen sin coordenadas y una referencia georreferenciada, el pipeline estima la homografia y situa la imagen en el mapa, util para inventariado o verificacion de activos.
- Ortorectificacion asistida: el campo de deformacion denso permite corregir distorsiones geometricas entre una imagen sensed y una referencia, paso previo a la generacion de mosaicos.
- Monitorizacion de cultivos y deforestacion: el registro preciso entre pasadas de satelite facilita el calculo de indices de vegetacion comparables pixel a pixel a lo largo del tiempo.
- Respuesta a emergencias y evaluacion de danos: alineando imagenes pre y post evento se pueden detectar cambios estructurales, siempre con validacion humana dado el caracter critico del dominio.
- Control de calidad en pipelines de adquisicion: el mapa de matchability sirve como metrica automatica para descartar pares de imagenes con solape insuficiente, nubes o texturas repetitivas antes de procesos costosos.
- Investigacion en vision por computador: como baseline reproducible para experimentos de matching denso en dominios de teledeteccion, con backbone DINOv3 fijado y pesos publicados.

## Benchmarks y rendimiento

Resultados reportados por los autores en el benchmark LEVIR-GM (codigo de evaluacion no publico):

| Metrica | LoRetta | RoMa v2 | Diferencia |
|---|---|---|---|
| AUC | 83,3% | 81,7% (inferido) | +1,6 puntos |
| PCK a 1 pixel | no disponible (valor absoluto) | no disponible | +6,5 puntos |
| PCK a 2 pixeles | no disponible (valor absoluto) | no disponible | +8,2 puntos |
| Latencia de inferencia | no disponible (valor absoluto) | no disponible | -47,8% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, al no tratarse de un modelo linguistico. Los valores absolutos de PCK y latencia no se detallan en la informacion disponible; solo se ofrecen las diferencias relativas frente a RoMa v2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint ocupa 1,29 GB en precision original, por lo que en fp32 se requiere aproximadamente esa cifra mas el overhead de activaciones para dos imagenes de 512 x 512 (estimacion orientativa de 4-8 GB en funcion del backend).
- GPU recomendadas: no especificadas por los autores. Por tamano, una GPU con 8-16 GB de VRAM (RTX 4070/4080, RTX 3090, A10, L4) deberia ser suficiente; A100 o H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con al menos 8 GB de VRAM, aunque no hay confirmacion oficial.
- Opciones de despliegue: el paquete se distribuye como state dictionary de PyTorch; el repositorio de GitHub indica los ejemplos de instalacion y uso. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: solo se conoce que la latencia es un 47,8% inferior a RoMa v2; no se publican valores absolutos ni throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / dominio | Rendimiento (LEVIR-GM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LoRetta | no disponible (backbone ViT-L/16) | 512 x 512 por imagen | Teledeteccion, matching denso | AUC 83,3% | DINOv3 License | Pesos publicos, codigo de entrenamiento no |
| RoMa v2 | no disponible | no disponible | Matching denso generico | AUC 81,7% (inferido), referencia de comparacion | no disponible en la informacion | Publico |
| DINOv3 ViT-L/16 | no disponible | no disponible | Backbone de vision general | No evaluado como matcher denso | DINOv3 License | Publico |

La comparacion se limita a RoMa v2, unico modelo frente al que los autores reportan metricas. No se dispone de datos para comparar con otros matchers densos especificos de teledeteccion en la informacion proporcionada.

## Limitaciones y advertencias

- Zonas con textura repetitiva o pobre, nubes, solape debil y cambios fuertes de apariencia pueden producir correspondencias plausibles pero incorrectas.
- Los errores se propagan a transformaciones o localizaciones erroneas; es obligatorio conservar la incertidumbre, rechazar resultados de baja confianza y verificar de forma independiente las salidas criticas.
- El rendimiento puede degradarse fuera de los supuestos de entrada: la imagen sensed debe tener un ground sampling distance no mayor que la referencia y una huella no mayor que esta.
- El redimensionado fijo a 512 x 512 no preserva la relacion de aspecto original, lo que puede distorsionar imagenes con ratios extremos.
- Cobertura limitada a los sensores, regiones, estaciones y tipos de cobertura del suelo representados en LEVIR-GM; no debe inferirse una cobertura demografica o geografica mayor que la descrita.
- La licencia DINOv3 prohibe usos militares o de guerra, aplicaciones nucleares, espionaje y el desarrollo o uso de armas; exige cumplimiento de leyes, proteccion de datos y controles comerciales.
- El uso en entornos de seguridad critica, legales, de vigilancia, inmobiliarios o de respuesta a emergencias requiere validacion humana; el modelo no debe tratarse como evidencia verificada.
- El dataset, el codigo de entrenamiento y el codigo de evaluacion no son publicos, lo que limita la reproducibilidad de los resultados reportados.
- Si se publican resultados derivados del checkpoint, la licencia DINOv3 exige reconocer los DINO Materials y citar LoRetta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRoss123/LoRetta
- Pagina del proyecto: https://www.siweiyu.com/work/loretta/
- Paper en arXiv: https://arxiv.org/abs/2608.04106
- Repositorio de codigo: https://github.com/yusiwei77-star/LoRetta
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/adc254450203739c8149213a7a69d8d905b4fcfa/LICENSE.md
- Contacto de seguridad: contact@siweiyu.com
