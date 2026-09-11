# Selvauma/hc-na-interface-deepmd

## Resumen

`Selvauma/hc-na-interface-deepmd` es un repositorio de HuggingFace que publica dos potenciales interatómicos de machine learning (MLIP) entrenados con DeepMD-kit para interfases ánodo|electrolito de baterías de ion sodio. En concreto, modela un ánodo de carbono duro (hard carbon) sodado en contacto con un electrolito líquido de NaPF₆ en disolvente EC:DEC, e incluye dos variantes comparables: una interfase desnuda (bare) y otra recubierta con una capa amorfa de MgO. El objetivo declarado es estudiar la formación de la SEI (solid electrolyte interphase) y el comportamiento de deposición de sodio (Na plating) en condiciones idénticas salvo por la presencia del recubrimiento.

El modelo lo desarrolla Selva Chandrasekaran Selvaraj (University of Illinois Chicago) y se enmarca en un manuscrito en preparación titulado "HC-Na | NaPF₆ EC:DEC Interface: SEI Formation and Na Plating". No es un modelo de lenguaje: es un potencial interatómico que predice energías y fuerzas para dinámica molecular, con dos celdas totalmente periódicas de 224 átomos (bare) y 264 átomos (MgO-coated). Ambos sistemas están igualados en sodación (x = Na/C = 0,0149, equivalente a 33,1 mAh/g).

Su relevancia actual es doble: por un lado, permite sustituir AIMD (VASP, PBE) por inferencia de MLIP en simulaciones de interfase a una fracción del coste computacional; por otro, ofrece un par de potenciales controlados que aíslan el efecto del recubrimiento de MgO sobre la SEI. El repositorio es muy reciente, con cero descargas y cero valoraciones, y la propia model card contiene marcas `TODO` pendientes de confirmar, incluida la licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de potencial interatomico DeepMD-kit (descriptor + fitting net); no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje); celdas periodicas de 224 atomos (bare) y 264 atomos (MgO-coated) |
| Tipos de cuantizacion | no disponible; el pipeline declarado incluye entrenamiento, freeze y compresion de DeepMD-kit, y los pesos se distribuyen en formato congelado |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | cc-by-4.0, marcada como provisional en la model card (`TODO: confirm`); pendiente de confirmacion por el autor |
| Formato de pesos | `.pb` (grafo congelado de DeepMD-kit): `model/HC_bare_interface.pb` (247,4 MB) y `model/HC_MgO_interface.pb` (362,7 MB) |
| Sistema bare | C₁₃₄F₁₂H₅₀Na₂O₂₄P₂, 224 atomos, 33,1 mAh/g |
| Sistema con recubrimiento | C₁₃₄F₁₂H₅₀Mg₂₀Na₂O₄₄P₂, 264 atomos, 33,1 mAh/g |
| Recubrimiento | MgO amorfo (Mg–O ≈ 1,93 Å, Mg–Mg ≈ 2,74 Å) |
| Sodacion (x = Na/C) | 0,0149 en ambos sistemas (igualada) |
| Pasos de entrenamiento | 500.000 en ambos modelos |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

Se trata de dos potenciales DeepMD-kit independientes, uno por sistema. DeepMD-kit emplea una arquitectura de dos etapas: un descriptor de entorno local que codifica las posiciones relativas de los átomos vecinos dentro de un radio de corte, seguido de una red de ajuste ("fitting net") que mapea ese descriptor a la energía atómica. La energía total se obtiene por suma de contribuciones atómicas y las fuerzas por diferenciación automática. El pipeline declarado por el autor es: relajación DFT de la interfase, seguida de AIMD con VASP usando el funcional PBE, y a continuación entrenamiento, freeze y compresión con DeepMD-kit. No se especifican en la información disponible el radio de corte, el tipo de descriptor, la arquitectura interna de la red ni el tamaño del conjunto de datos de entrenamiento.

Las celdas son totalmente periódicas (sin vacío), lo que es coherente con un estudio de interfase electrodo|electrolito. En ambos casos el anión PF₆⁻ se confirma intacto por geometría, de modo que los potenciales no han sido entrenados para describir la descomposición de la sal. Como referencia de validación a escala clásica, el autor menciona una caja de electrolito de 19.888 átomos descrita con el campo de fuerzas clásico OPLS-AA, empleada para contrastar el comportamiento del electrolito masivo; esa caja no usa los potenciales de DeepMD. El código de producción se distribuye a través del repositorio HPCA del propio autor. Existen además fine-tunes de MACE para ambos sistemas en entrenamiento, aún no incluidos en el repositorio.

## Capacidades

- Predicción de energía potencial y fuerzas interatómicas para dinámica molecular clásica sobre las dos interfases HC|NaPF₆ EC:DEC publicadas.
- Simulación de la interfase ánodo|electrolito en condiciones periódicas, sin vacío, apta para estudiar la región interfacial.
- Comparación controlada bare vs. MgO-coated: ambos potenciales reproducen la misma sodación (x = 0,0149) y capacidad (33,1 mAh/g), de modo que las diferencias observadas son atribuibles al recubrimiento.
- Descripción de un recubrimiento amorfo de MgO con geometría caracterizada (Mg–O ≈ 1,93 Å, Mg–Mg ≈ 2,74 Å).
- Descripción del electrolito NaPF₆ en EC:DEC con el anión PF₆⁻ intacto.
- Integración con el ecosistema DeepMD-kit (LAMMPS, i-PI y otras interfaces compatibles) para simulaciones de dinámica molecular.
- No dispone de tool calling, function calling, capacidades de agente, multimodalidad ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Estudio de formación de SEI en ánodos de carbono duro: los potenciales permiten ejecutar dinámica molecular sobre la interfase HC|NaPF₆ EC:DEC a una fracción del coste de AIMD, manteniendo precisión de nivel DFT (PBE) dentro del dominio de entrenamiento, para seguir la evolución estructural de la interphase.
- Evaluación del efecto de recubrimientos artificiales: al existir dos modelos apareados con la misma sodación y capacidad, se puede cuantificar qué cambia en la interfase al interponer una capa amorfa de MgO entre el carbono duro y el electrolito.
- Análisis de deposición de sodio (Na plating): simulaciones de relajación y dinámica sobre la cara del ánodo en contacto con el electrolito para detectar tendencias de acumulación de Na metálico.
- Extensión de trayectorias AIMD cortas: uso como potencial de producción para alcanzar escalas de tiempo y tamaño inaccesibles a AIMD con VASP, partiendo de configuraciones relajadas por DFT.
- Generación de datos para esquemas de aprendizaje activo: las trayectorias producidas pueden servir como candidatas para seleccionar configuraciones de alta incertidumbre y reentrenar el potencial con DFT.
- Validación cruzada entre niveles de teoría: contraste de los resultados del MLIP frente a la caja clásica de 19.888 átomos con OPLS-AA mencionada por el autor, para comprobar si el comportamiento del electrolito masivo es consistente entre el nivel clásico y el nivel DFT/MLIP.
- Cribado de estrategias de protección de superficie: el par de potenciales sirve como punto de partida metodológico para evaluar otros recubrimientos o espesores, siempre que se reentrene o fine-tune el modelo para el nuevo sistema.
- Estudio de difusión de iones Na⁺ a través de la región interfacial: análisis de mecanismos de transporte y de la estructura de solvatación en las proximidades del ánodo.

## Benchmarks y rendimiento

Los únicos datos de error publicados son los de validación (conjunto held-out) leídos del `lcurve.out` de DeepMD-kit en el paso final de entrenamiento. No se han publicado resultados de benchmarks comparativos frente a otros potenciales, ni métricas de propiedades macroscópicas (difusión, conductividad, energía de formación de SEI).

| Fichero | RMSE energía (eV/átomo) | RMSE fuerza (eV/Å) | Pasos de entrenamiento | Tamaño |
|---|---|---|---|---|
| `model/HC_MgO_interface.pb` | 0,00131 | 0,202 | 500.000 | 362,7 MB |
| `model/HC_bare_interface.pb` | 0,00292 | 0,269 | 500.000 | 247,4 MB |

Los valores proceden directamente del autor; la model card indica explícitamente que no han sido rederivados ni estimados. No se detalla el tamaño del conjunto de validación ni su composición.

## Requisitos de hardware

- Los ficheros de pesos ocupan 247,4 MB y 362,7 MB respectivamente. Por tamaño, ambos modelos caben sin problema en cualquier GPU de consumo (por ejemplo, RTX 3060 12 GB o RTX 4090 24 GB) e incluso pueden ejecutarse en CPU, ya que la inferencia de un MLIP es muy inferior en coste a la de un modelo de lenguaje del mismo orden de magnitud en disco.
- No se publican cifras de VRAM, latencia ni throughput para estos modelos concretos; cualquier estimación depende del tamaño de celda, del radio de corte y del tamaño de lote de configuraciones evaluadas.
- El coste real de inferencia está dominado por la construcción de la lista de vecinos y por el número de átomos del sistema, no por el tamaño del fichero de pesos.
- En el repositorio no se incluye ninguna caja de 19.888 átomos evaluada con estos potenciales: esa caja se simuló con el campo de fuerzas clásico OPLS-AA y solo se menciona como referencia de validación.
- Opciones de despliegue: el formato `.pb` congelado de DeepMD-kit es compatible con el ecosistema DeepMD-kit, lo que incluye su integración con LAMMPS y con i-PI, así como las utilidades de línea de comandos del propio paquete (por ejemplo, para test y compresión). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- GPU recomendadas: no disponible.

## Comparativa con modelos similares

La comparación es necesariamente cualitativa, porque el autor no publica métricas frente a terceros. Los potenciales universales de la literatura (MACE-MP-0, CHGNet, M3GNet) están entrenados sobre grandes bases de datos de materiales inorgánicos con PBE, mientras que este repositorio contiene potenciales especializados en un único sistema de interés. Los campos marcados como no disponibles reflejan ausencia de datos en la información proporcionada, no ausencia del dato en la fuente original.

| Modelo | Tipo | Cobertura | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Selvauma/hc-na-interface-deepmd` (bare) | DeepMD-kit, especializado | Interfase HC|NaPF₆ EC:DEC, 224 átomos, x = 0,0149 | AIMD propio (VASP, PBE) | cc-by-4.0 (provisional, `TODO: confirm`) | Publicado en HuggingFace; 0 descargas |
| `Selvauma/hc-na-interface-deepmd` (MgO) | DeepMD-kit, especializado | Interfase HC|NaPF₆ EC:DEC con recubrimiento de MgO, 264 átomos | AIMD propio (VASP, PBE) | cc-by-4.0 (provisional, `TODO: confirm`) | Publicado en HuggingFace; 0 descargas |
| MACE fine-tunes del mismo autor | MACE | Mismos dos sistemas (bare y MgO) | no disponible | no disponible | Anunciados como en entrenamiento, aún no incluidos |
| MACE-MP-0 | Potencial universal (equivariante) | Materiales inorgánicos en general; no específico para interfases de batería | Base de datos tipo Materials Project con PBE | no disponible en la información proporcionada | Público |
| CHGNet | Potencial universal basado en grafo | Materiales inorgánicos en general | Base de datos tipo Materials Project con PBE | no disponible en la información proporcionada | Público |
| M3GNet | Potencial universal basado en grafo | Materiales inorgánicos en general | Base de datos tipo Materials Project con PBE | no disponible en la información proporcionada | Público |

Diferencias clave: los potenciales universales ofrecen cobertura amplia pero menor fidelidad en un sistema concreto y no describen de forma fiable sales, disolventes orgánicos y recubrimientos amorfos como los de este repositorio; a cambio, este modelo solo es válido dentro de su dominio de entrenamiento y no puede extrapolarse a otros electrolitos, otras sodaciones u otros recubrimientos. No se dispone de comparación cuantitativa de error o de propiedades predichas entre estos modelos y los aquí publicados.

## Limitaciones y advertencias

- Licencia no confirmada: la model card incluye un comentario `TODO: confirm` sobre la licencia cc-by-4.0, descrita como provisional. Antes de cualquier uso comercial debe verificarse con el autor.
- Repositorio sin validación comunitaria: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin informes independientes de reproducibilidad.
- Dominio de entrenamiento muy estrecho: dos únicos sistemas, ambos con x = Na/C = 0,0149 y 33,1 mAh/g. La capacidad es muy baja frente a la de un carbono duro real (del orden de cientos de mAh/g), por lo que el régimen de sodación estudiado es poco representativo de un ánodo cargado.
- Tamaño de celda reducido: 224 y 264 átomos. Son celdas pequeñas para una interfase electrodo|electrolito, con riesgo de efectos de tamaño finito y de artefactos de periodicidad.
- Composición de electrolito limitada: NaPF₆ en EC:DEC sin aditivos (no se mencionan FEC, VC ni otros). Los aditivos son determinantes en la química real de la SEI.
- El anión PF₆⁻ se confirma intacto por geometría en ambos sistemas, de modo que el modelo no captura la descomposición de la sal, un proceso central en la formación de SEI.
- Funcional único: AIMD con PBE. Los resultados heredan las limitaciones conocidas de PBE para energías de formación y para interacciones no covalentes, y no se documenta el tratamiento de dispersión.
- Sin fine-tunes de MACE disponibles: anunciados como en entrenamiento, lo que impide de momento la comparación entre arquitecturas sobre los mismos sistemas.
- Riesgo de extrapolación: al ser potenciales especializados, su uso fuera de las composiciones, temperaturas y densidades cubiertas por el AIMD de entrenamiento puede producir energías y fuerzas no fiables sin aviso explícito.
- No se publican el tamaño ni la composición del conjunto de datos de entrenamiento y validación, la temperatura del AIMD, el radio de corte ni el esquema de pesos; esto dificulta evaluar la cobertura real del dominio.
- No se han publicado benchmarks frente a otros potenciales ni propiedades macroscópicas calculadas, por lo que el rendimiento predictivo solo está respaldado por el RMSE de validación.
- La model card contiene comentarios de plantilla sin resolver, lo que sugiere un proceso de publicación todavía en curso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Selvauma/hc-na-interface-deepmd
- Repositorio de código HPCA citado por el autor: https://github.com/selvachandrasekaranselvaraj/hpca
- Documentación de DeepMD-kit (formato `.pb`, freeze y compress): https://docs.deepmodeling.com/projects/deepmd/
- Búsqueda web: no se recuperó ningún resultado relevante. Los únicos enlaces devueltos correspondían al videojuego Among Us (Google Play, Softonic, Steam, Gizmodo, Gamepix) y no guardan relación con el modelo. No se han localizado por esta vía papers, blogs ni demos adicionales.
- Manuscrito asociado: en preparación, sin enlace o identificador disponible; título declarado "HC-Na | NaPF₆ EC:DEC Interface: SEI Formation and Na Plating" (variantes bare y con recubrimiento de MgO), por Selva Chandrasekaran Selvaraj, University of Illinois Chicago.
