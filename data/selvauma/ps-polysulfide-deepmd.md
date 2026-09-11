# Selvauma/ps-polysulfide-deepmd

## Resumen

El repositorio Selvauma/ps-polysulfide-deepmd publica dos potenciales interatomicos de red neuronal entrenados con DeePMD-kit para el estudio de la conversion de polisulfuros de litio (Li₂Sₓ) en baterias de litio-azufre (Li-S). Su autor es Selva Chandrasekaran Selvaraj (University of Illinois Chicago), en colaboracion con el grupo de modelado mesoscopico MonaLiSa (Purdue University). No se trata de un modelo de lenguaje: es un potencial de mecanica molecular (MLIP) que predice energias y fuerzas entre atomos, pensado para simulaciones de dinamica molecular de materiales.

El problema que aborda es la perdida de capacidad en baterias Li-S provocada por el efecto shuttle: los polisulfuros solubles (Li₂Sₓ, x = 1-8) se disuelven y migran del catodo al anodo. El proyecto caracteriza las energeticas de formacion de Sₓ y Li₂Sₓ y su union a sustratos de carbono, una estrategia de mitigacion, y alimenta un modelo mesoscopico de precipitacion en el catodo. La model card indica que los resultados de referencia a nivel DFT ya estan convergidos y listos para publicacion, y que no se planifica mas DFT, AIMD ni MLMD en este proyecto (decision de alcance de 2026-09-02), por lo que el conjunto publicado es el final.

El repositorio (0,2 GB) contiene dos grafos congelados en formato `.pb`: `ps_composite_variant1.pb` (89,1 MB, 1.000.000 pasos, RMSE de validacion de 0,00718 eV/atom en energia y 0,0903 eV/Å en fuerza) y `ps_reaction.pb` (81,0 MB, 400.000 pasos, RMSE de 0,00139 eV/atom y 0,1 eV/Å). Son 2 de los 5 potenciales del conjunto de variantes de composite/carbono poroso/polisulfuro, seleccionados por menor RMSE de fuerza en validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Potencial interatomico de red neuronal entrenado con DeePMD-kit; grafo congelado (frozen) en formato `.pb`. El tipo de descriptor concreto no se especifica en la model card |
| Parametros totales | no disponible (el autor no publica recuento de parametros; los dos checkpoints ocupan 89,1 MB y 81,0 MB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje). La model card no especifica el tamano maximo de celda o de sistema simulado |
| Tipos de cuantizacion | no disponible. El pipeline documentado incluye la etapa de compresion de DeePMD-kit (train/freeze/compress) |
| Idiomas soportados | no aplicable (modelo de potencial interatomico, no procesa texto) |
| Licencia | cc-by-4.0 segun los metadatos de HuggingFace; en el cabecero YAML de la model card la linea aparece marcada como placeholder con "TODO: confirm" |
| Formato de pesos | `.pb` (grafos congelados de TensorFlow generados por DeePMD-kit) |
| Dominio de aplicacion | Quimica de polisulfuros de litio y sustratos de carbono para baterias Li-S |
| Sistemas cubiertos | Sₓ en fase gas (x = 1-8); Li₂Sₓ (x = 1, 2, 4, 6, 8) y S₈ sobre sustrato de "flake" de carbono |
| Pasos de entrenamiento | 1.000.000 (`ps_composite_variant1.pb`) y 400.000 (`ps_reaction.pb`) |
| Numero de checkpoints publicados | 2 de 5 variantes del conjunto de entrenamiento |

## Arquitectura y entrenamiento

La model card describe un flujo de trabajo con DeePMD-kit: entrenamiento, congelado (freeze) y compresion de la red, lo que produce los ficheros `.pb` incluidos. No se detalla en el README el descriptor usado, el numero de capas ni el tamano de la red, por lo que esos datos no estan disponibles. El ajuste se realizo sobre datos generados con VASP/PAW, funcional PBE-GGA, energia de corte ENCUT de 420-450 eV y convergencia de fuerzas de ±10 meV/Å, con malla densa de puntos k para los sustratos de carbono periodicos y solo el punto Γ para los clusters moleculares de Sₓ y Li₂Sₓ. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas equivalentes, que no aplican a este tipo de modelo.

Los errores de validacion declarados son RMSE de energia de 0,00718 eV/atom y RMSE de fuerza de 0,0903 eV/Å para `ps_composite_variant1.pb`, y 0,00139 eV/atom y 0,1 eV/Å para `ps_reaction.pb`. El autor indica que estos valores se leen directamente del fichero `lcurve.out` de DeePMD-kit en el paso final de entrenamiento, sin reestimar. Como referencia de la parte DFT, la model card menciona energias de formacion de Sₓ en fase gas (x = 1-8) y energias de union de Li₂Sₓ (x = 1, 2, 4, 6, 8) mas S₈ sobre un sustrato de carbono, resultados ya convergidos y en preparacion de manuscrito ("Atomic Reaction Barrier of PS Conversion").

## Capacidades

- Prediccion de energias potenciales y fuerzas atomicas para configuraciones de Sₓ y Li₂Sₓ, habilitando dinamica molecular con precision cercana a DFT a un coste computacional menor.
- Calculo de energeticas de formacion y de union (binding) de polisulfuros sobre sustratos de carbono.
- Estimacion de barreras de reaccion relacionadas con la conversion de polisulfuros, segun el titulo del manuscrito en preparacion.
- Simulacion de sistemas periodicos de carbono (malla densa de puntos k) y de clusters moleculares aislados (solo Γ).
- Generacion de trayectorias de dinamica molecular que pueden alimentar modelos mesoscopicos de precipitacion en el catodo (MonaLiSa).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no procesa texto ni imagenes.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad generativa.

## Casos de uso

- Simulacion de la conversion de polisulfuros en el catodo de una bateria Li-S: el potencial permite ejecutar dinamica molecular sobre configuraciones de Li₂Sₓ y Sₓ con errores de fuerza en validacion de 0,09-0,1 eV/Å, lo que hace viable explorar mecanismos de reaccion que a nivel AIMD serian demasiado costosos.
- Calculo de barreras de reaccion de la conversion de polisulfuros: el checkpoint `ps_reaction.pb` esta entrenado especificamente con este proposito y presenta el menor RMSE de energia de los dos (0,00139 eV/atom), adecuado para estudiar caminos de reaccion.
- Cribado de sustratos de carbono para mitigar el efecto shuttle: las energias de union calculadas sobre el sustrato de carbono permiten comparar candidatos y priorizar los que fijan mejor los polisulfuros.
- Alimentacion de un modelo mesoscopico de precipitacion en el catodo: los valores de energia y barreras obtenidos con el potencial se usan como entrada del modelo MonaLiSa (Purdue) para predecir la precipitacion de Li₂S.
- Estudio de la estabilidad termodinamica relativa de las distintas especies Sₓ (x = 1-8) y Li₂Sₓ (x = 1, 2, 4, 6, 8): permite reproducir y ampliar las energeticas de formacion en fase gas ya convergidas a nivel DFT.
- Extension de conjuntos de datos de entrenamiento mediante active learning: las trayectorias generadas con el potencial pueden etiquetarse despues con DFT para refinar futuros MLIP, aunque el autor ha declarado que no planifica mas trabajo de este tipo en el proyecto.
- Analisis de sensibilidad de resultados DFT con un coste reducido: dado que los errores de validacion estan documentados, se puede acotar la incertidumbre esperada en propiedades derivadas antes de lanzar calculos de referencia.
- Reproducibilidad y verificacion metodologica: los ficheros `.pb` y la convergencia registrada en `lcurve.out` permiten a terceros replicar el flujo VASP/PAW + PBE-GGA + DeePMD-kit descrito.

## Benchmarks y rendimiento

Los unicos datos numericos publicados son los errores de validacion de los dos potenciales. No se han publicado resultados de benchmarks externos (comparativas tipo MMLU, HumanEval o GSM8K no aplican a este tipo de modelo) en la informacion disponible.

| Checkpoint | RMSE energia (eV/atom) | RMSE fuerza (eV/Å) | Pasos de entrenamiento | Tamano |
|---|---|---|---|---|
| `model/ps_composite_variant1.pb` | 0,00718 | 0,0903 | 1.000.000 | 89,1 MB |
| `model/ps_reaction.pb` | 0,00139 | 0,1 | 400.000 | 81,0 MB |

Segun la model card, los valores proceden del fichero `lcurve.out` de DeePMD-kit en el paso final de entrenamiento, medidos sobre el conjunto de validacion (held-out), y ambos checkpoints se seleccionaron por presentar el menor RMSE de fuerza entre las variantes del conjunto de composite/carbono poroso/polisulfuro.

## Requisitos de hardware

- La model card no publica requisitos de VRAM, GPU recomendadas, latencia ni throughput.
- Los dos checkpoints ocupan 89,1 MB y 81,0 MB, por lo que el peso del modelo en memoria es reducido en comparacion con modelos de lenguaje o de vision; el cuello de botella en la practica es el coste de la simulacion de dinamica molecular (numero de atomos, pasos de integracion y tamano de celda), no el del modelo.
- No se indica si el modelo cabe en GPU de consumo; dado el tamano de los ficheros, es esperable que quepa en practicamente cualquier GPU con varios GB de VRAM, pero no hay confirmacion del autor ni cifras medidas.
- El ecosistema DeePMD-kit, con el que se generaron los `.pb`, ofrece inferencia tanto en CPU como en GPU y dispone de interfaces con LAMMPS, i-PI y ASE, ademas de la propia API de Python del paquete.
- No hay datos publicados de rendimiento (atomos por segundo, escalado con GPU) para estos dos checkpoints concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La categoria de potenciales interatomicos de red neuronal incluye otros desarrollos conocidos (por ejemplo MACE-MP-0, CHGNet o M3GNet), pero la model card del autor no incluye comparaciones frente a ninguno de ellos y no se ha encontrado documentacion adicional en la busqueda web realizada, que no devolvio resultados relacionados con este repositorio.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selvauma/ps-polysulfide-deepmd | no disponible (2 checkpoints de 89,1 MB y 81,0 MB) | no aplicable; tamano de celda no especificado | RMSE de validacion: 0,00718 y 0,00139 eV/atom; 0,0903 y 0,1 eV/Å | cc-by-4.0 (placeholder en el YAML, con "TODO: confirm") | Publicado en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Alternativas de la misma categoria | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo, razonamiento ni respuestas conversacionales; cualquier uso fuera de la simulacion atomistica no es aplicable.
- Dominio de entrenamiento estrecho: los sistemas documentados son Sₓ (x = 1-8), Li₂Sₓ (x = 1, 2, 4, 6, 8), S₈ y sustratos de carbono tipo "flake"; no se ha validado el comportamiento fuera de esas especies, temperaturas o fases.
- Desarrollo cerrado: segun la decision de alcance del 2026-09-02 recogida en la model card, no se planifica mas DFT, AIMD ni MLMD en el proyecto y lo publicado es el conjunto final. Caben correcciones de errores, pero no una ampliacion del dominio.
- Cobertura parcial: solo se publican 2 de los 5 potenciales del conjunto de variantes; los demas no estan disponibles en este repositorio.
- Errores de fuerza de 0,0903 y 0,1 eV/Å en validacion: en el calculo de barreras de reaccion ese nivel de error puede ser significativo, especialmente en el checkpoint `ps_reaction.pb`, el de mayor RMSE de fuerza de los dos.
- El nivel teorico declarado es PBE-GGA sin que se mencione ninguna correccion de dispersion (por ejemplo DFT-D3). Dado que PBE tiende a describir de forma deficiente las interacciones de van der Waals, las energias de union de polisulfuros sobre carbono deberian interpretarse con cautela; la model card no aborda este punto.
- Licencia ambigua: los metadatos de HuggingFace indican cc-by-4.0, pero el propio cabecero YAML de la model card marca la linea como placeholder con "TODO: confirm". Conviene verificar la licencia con el autor antes de un uso comercial.
- Sin validacion externa independiente ni adopcion registrada (0 descargas y 0 likes en el momento de la consulta), por lo que no hay evidencia de replicacion por terceros.
- No se especifican los sesgos ni las limitaciones de idioma porque no son aplicables, pero tampoco se documenta el limite de tamano de sistema simulado ni el regimen de temperatura para el que el potencial es valido.
- Los resultados DFT de referencia y el manuscrito asociado estan en preparacion, por lo que las cifras publicadas podrian cambiar en la version final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Selvauma/ps-polysulfide-deepmd
- Toolkit DeePMD-kit, referenciado en la model card y usado para entrenar, congelar y comprimir los potenciales: https://github.com/deepmodeling/deepmd-kit
- Busqueda web realizada: no devolvio ningun enlace relacionado con el modelo, el autor o el proyecto (los resultados obtenidos correspondian a un comercio de mobiliario sin relacion con el contenido).
- Paper, blog, repositorio auxiliar o demo: no disponible en la informacion proporcionada. El unico material adicional citado es el manuscrito en preparacion "Atomic Reaction Barrier of PS Conversion" (Selva Chandrasekaran Selvaraj, University of Illinois Chicago), sin enlace publicado.
