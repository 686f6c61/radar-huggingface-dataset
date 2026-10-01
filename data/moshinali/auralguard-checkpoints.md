# MoshinAli/auralguard-checkpoints

## Resumen

AuralGuard es un sistema de deteccion de voz sintetizada (deepfake de audio) publicado como repositorio de checkpoints y artefactos de evaluacion asociados al articulo "AuralGuard: Multi-View One-Class Learning for Generalizable and Calibrated Detection of AI-Generated Speech in the Wild", firmado por Mohsin Ibna Hossain, Md. Muttakin, Sadman Hasan Miraj y Mohammad Mahmudul Hasan, del Departamento de Ciencias de la Computacion de la American International University-Bangladesh (AIUB). Se trata de un modelo de clasificacion de audio, no de un modelo generativo: su tarea es asignar a una locucion una puntuacion de probabilidad de que haya sido producida por un sintetizador o por un sistema de clonacion de voz.

La propuesta tecnica combina una formulacion de aprendizaje de una clase (one-class, OCS) con representaciones de multiples vistas y atencion cruzada con compuerta, sobre un backbone acustico basado en WavLM-Large y una cabeza de atencion de grafo tipo AASIST, con anadido de aprendizaje contrastivo supervisado (SupCon) en la version v2. El objetivo declarado no es solo discriminar, sino generalizar fuera de dominio y quedar bien calibrado: el articulo reporta EER, min t-DCF, AUROC, ECE y Brier score con intervalos de confianza bootstrap no parametricos al 95 por ciento (B=1000).

Su relevancia actual viene de la explosion de voces sinteticas de alta calidad y de la necesidad de sistemas anti-spoofing que funcionen sin reentrenamiento sobre dominios nuevos. El repositorio incluye tanto los checkpoints de AuralGuard v1 y v2 como cuatro baselines reproducibles (LFCC-LCNN, RawNet2, AASIST y WavLM+OCS), lo que lo convierte en un banco de comparacion util para investigacion en deteccion de deepfakes de voz. El repositorio ocupa 121 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples vistas con atencion cruzada con compuerta, backbone acustico WavLM-Large, cabeza AASIST (red de atencion de grafos), aprendizaje de una clase (OCS) y aprendizaje contrastivo supervisado (SupCon) en v2; el articulo no detalla la composicion exacta de cada vista |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de audio; no se especifica la duracion de los segmentos de entrada) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en formato .ckpt de PyTorch; no hay versiones cuantizadas declaradas) |
| Idiomas soportados | no disponible; los corpus de entrenamiento y evaluacion declarados (ASVspoof 2019 LA, In-the-Wild, WaveFake) son mayoritariamente en ingles, y el sistema opera sobre caracteristicas acusticas, no sobre texto |
| Licencia | MIT |
| Formato de pesos | Checkpoints .ckpt de PyTorch (rutas `checkpoints/*/best.ckpt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que AuralGuard v2 es una arquitectura multi-vista con atencion cruzada con compuerta, combinada con una cabeza AASIST, aprendizaje de una clase y aprendizaje contrastivo supervisado. La version v1 prescinde de la atencion cruzada con compuerta y del SupCon. El baseline B5, que el propio articulo usa como referencia cercana, es una variante de vista unica sobre WavLM-Large con cabeza AASIST y objetivo de una clase. Los demas baselines cubren enfoques mas clasicos: B1 usa 60 coeficientes LFCC con una CNN Max-Feature-Map, B2 es RawNet2 (convolucion sinc sobre onda cruda, bloques residuales y GRU) y B3 es AASIST (convolucion sinc mas red de atencion de grafo).

En cuanto al entrenamiento, el articulo especifica que los modelos se entrenaron estrictamente una sola vez sobre ASVspoof 2019 LA y se evaluaron en zero-shot fuera de dominio sobre In-the-Wild y WaveFake. No se detalla en la informacion proporcionada el numero de tokens o de horas de audio, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (algo que, por otra parte, no aplica a un clasificador acustico). Las innovaciones declaradas son la combinacion multi-vista con atencion cruzada con compuerta, el regimen de una clase para favorecer la generalizacion, y el enfasis explicito en calibracion de probabilidades medida con ECE y Brier score ademas de las metricas de discriminacion habituales.

## Capacidades

- Clasificacion binaria de audio: distingue locucion genuina de locucion generada o clonada.
- Deteccion de voz sintetizada y deepfakes de audio en escenarios fuera de dominio (zero-shot) sin reentrenamiento sobre el dominio objetivo.
- Salida probabilistica calibrada, con ECE reportado, lo que permite fijar umbrales de decision con significado estadistico.
- Evaluacion anti-spoofing integrable en pipelines de verificacion de locutor (ASV), con la metrica min t-DCF como referencia.
- Inferencia sobre onda cruda o sobre caracteristicas espectrales segun la variante (LFCC, sinc-conv, WavLM), lo que facilita comparaciones controladas.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un clasificador, no un modelo de lenguaje.
- No hay capacidades de vision, audio generativo, thinking mode ni traduccion; el ambito es exclusivamente acustico y discriminativo.
- Cobertura multilingue: no documentada. El rendimiento depende del dominio acustico y del codec, no de un inventario de idiomas declarado.

## Casos de uso

- Verificacion antifraude en banca y aseguradoras: el modelo puntua la probabilidad de que la voz de un cliente en un proceso de verificacion telefonica haya sido sintetizada, y su calibracion permite fijar un umbral de rechazo con una tasa de falsos positivos controlada.
- Seguridad en autenticacion biometrica por voz (anti-spoofing de sistemas ASV): la metrica min t-DCF y el entrenamiento sobre ASVspoof 2019 LA estan alineados con este escenario, lo que permite usarlo como modulo de deteccion de ataques de presentacion.
- Moderacion de contenido en plataformas de audio y podcast: filtrado automatizado de clips sospechosos de ser generados por IA antes de su publicacion o durante revisiones posteriores.
- Filtrado de datasets para entrenamiento de TTS y ASV: deteccion de muestras sinteticas contaminantes en corpus recopilados a gran escala, con el objetivo de evitar fugas entre conjuntos de entrenamiento y evaluacion.
- Verificacion periodistica y analisis forense de audio: cribado previo de grabaciones aportadas como prueba, priorizando las que presentan alta probabilidad de sintesis para una revision humana posterior.
- Deteccion de estafas telefonicas con voz clonada (vishing): puntuacion en tiempo real de llamadas entrantes en contact centers, con escalado a un operador cuando la probabilidad supera el umbral operativo.
- Cumplimiento normativo y trazabilidad: generacion de registros de probabilidad calibrada para documentar el tratamiento de contenido potencialmente sintetico conforme a marcos como el Reglamento europeo de IA.
- Investigacion reproducible en deteccion de deepfakes de voz: el repositorio incluye cuatro baselines con el mismo protocolo de evaluacion, lo que permite replicar comparaciones sin reentrenar desde cero.

## Benchmarks y rendimiento

Resultados declarados en la model card. Entrenamiento unico sobre ASVspoof 2019 LA y evaluacion zero-shot fuera de dominio. Los intervalos son de confianza bootstrap no parametricos al 95 por ciento (B=1000).

| Arquitectura | EER in-domain (19LA) % | min t-DCF | EER zero-shot (In-the-Wild) % | AUROC ITW | ECE ITW (menor es mejor) | EER zero-shot (WaveFake) % |
|---|---|---|---|---|---|---|
| B1 (LFCC-LCNN) | 16,29 [15,97; 16,63] | 0,6131 | 50,62 [49,72; 51,49] | 0,4979 | 0,4292 | 45,32 [44,82; 45,82] |
| B2 (RawNet2) | 8,99 [8,72; 9,23] | 0,3444 | 38,08 [37,28; 38,89] | 0,6671 | 0,5761 | 50,37 [49,88; 50,88] |
| B3 (AASIST) | 10,63 [10,36; 10,92] | 0,3921 | 42,33 [41,52; 43,14] | 0,6122 | 0,5552 | 49,89 [49,39; 50,39] |
| B5 (WavLM+OCS) | 2,86 [2,73; 3,00] | 0,1041 | 16,55 [16,12; 16,98] | 0,9103 | 0,2320 | 47,43 [46,93; 47,93] |
| AuralGuard v1 | 7,30 [7,12; 7,50] | 0,2494 | 23,47 [23,03; 23,89] | 0,8345 | 0,0965 | 48,72 [48,22; 49,22] |
| AuralGuard v2 | 6,81 [6,61; 7,00] | 0,2398 | 19,19 [18,78; 19,61] | 0,8820 | 0,1716 | 45,19 [44,69; 45,71] |

Lectura de los datos: AuralGuard v2 mejora a v1 en EER in-domain (6,81 frente a 7,30), EER zero-shot en In-the-Wild (19,19 frente a 23,47) y AUROC ITW (0,8820 frente a 0,8345), y es la mejor variante del repositorio en WaveFake (45,19). Sin embargo, el baseline B5 (WavLM-Large + OCS) supera a ambas versiones de AuralGuard en EER in-domain (2,86), min t-DCF (0,1041) y EER zero-shot en In-the-Wild (16,55). La mejor calibracion en In-the-Wild corresponde a AuralGuard v1 (ECE 0,0965), seguida de AuralGuard v2 (0,1716); B5 queda en 0,2320. No hay resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K y similares) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, una variante de vista unica sobre WavLM-Large implica un codificador de aproximadamente 300 millones de parametros; en fp32 eso ronda 1,2-1,5 GB solo en pesos, y en inferencia con lotes pequenos cabe holgadamente en GPUs de consumo. Esta cifra es una estimacion derivada de la arquitectura declarada, no un dato publicado.
- Repositorio: 121 GB en total, correspondiente a seis checkpoints. Conviene descargar unicamente el checkpoint necesario mediante `hf_hub_download` en lugar de clonar el repositorio completo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en fp32 de una sola variante. Para procesamiento por lotes a gran escala son preferibles A100, H100 o L40S. En consumo, RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes para inferencia interactiva.
- CPU: la inferencia es viable en CPU para audios cortos, aunque con latencia mucho mayor; no se publican cifras de rendimiento en CPU.
- Opciones de despliegue: PyTorch y PyTorch Lightning para cargar los .ckpt; torchaudio para el frontend acustico. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje. La exportacion a ONNX o TorchScript no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos externos en la informacion proporcionada, por lo que la comparacion se limita a las variantes incluidas en el propio repositorio, todas evaluadas bajo el mismo protocolo.

| Modelo | Enfoque | EER 19LA % | EER ITW % | ECE ITW | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AuralGuard v2 | Multi-vista + atencion cruzada con compuerta + AASIST + OCS + SupCon | 6,81 | 19,19 | 0,1716 | MIT | Checkpoint .ckpt en el repositorio |
| AuralGuard v1 | Multi-vista + AASIST + OCS | 7,30 | 23,47 | 0,0965 | MIT | Checkpoint .ckpt en el repositorio |
| B5 (WavLM+OCS) | Vista unica WavLM-Large + AASIST + OCS | 2,86 | 16,55 | 0,2320 | MIT | Checkpoint .ckpt en el repositorio |
| B3 (AASIST) | Convolucion sinc sobre onda cruda + atencion de grafo | 10,63 | 42,33 | 0,5552 | MIT | Checkpoint .ckpt en el repositorio |
| B2 (RawNet2) | Convolucion sinc + bloques residuales + GRU | 8,99 | 38,08 | 0,5761 | MIT | Checkpoint .ckpt en el repositorio |

Comparacion con alternativas externas de deteccion de voz sintetizada: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El propio articulo reporta que el baseline B5 supera a AuralGuard v1 y v2 en EER in-domain, min t-DCF y EER zero-shot en In-the-Wild. AuralGuard destaca en calibracion y en WaveFake, pero no es la variante mas discriminativa del repositorio.
- Los EER fuera de dominio en In-the-Wild (19,19 por ciento en v2) y en WaveFake (45,19 por ciento en v2) son elevados en terminos absolutos; en WaveFake el rendimiento se acerca al azar en varias variantes.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos con consecuencias operativas, especialmente al puntuar voces con ruido, codecs agresivos o acentos poco representados en ASVspoof 2019 LA.
- Sesgos conocidos: no documentados explicitamente. Cabe esperar sesgo de dominio, dado que el entrenamiento se realizo sobre un unico corpus en ingles; el comportamiento sobre otros idiomas, edades o condiciones de grabacion no esta caracterizado.
- Cobertura de sintetizadores: el sistema se entrena sobre los generadores presentes en ASVspoof 2019 LA. Su comportamiento frente a modelos TTS o de clonacion posteriores no puede garantizarse sin evaluacion adicional.
- Restricciones de licencia: la licencia es MIT, que permite uso comercial, modificacion y redistribucion con aviso de copyright. No se declaran restricciones adicionales de acceso ni terminos extra en la informacion disponible.
- Estado del repositorio: cero descargas y cero likes, sin model card renderizada en la pagina de HuggingFace en el momento de la consulta. La validacion por parte de terceros es practicamente inexistente.
- Caveat de produccion: no hay versiones cuantizadas, no hay exportaciones ONNX ni TensorRT publicadas y no se documentan latencias, por lo que el coste de integracion en un pipeline en tiempo real debe medirse por cuenta propia.
- Los resultados declarados proceden de la model card y del manuscrito de los propios autores, en envio a revista; no se indica que hayan pasado por revision por pares en el momento de la consulta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MoshinAli/auralguard-checkpoints
- Manuscrito camera-ready (17 paginas) en el repositorio: `paper/main.pdf` (https://huggingface.co/MoshinAli/auralguard-checkpoints/blob/main/paper/main.pdf)
- Codigo oficial: https://github.com/MIHMahmudEli/auralguardv2
- Perfil del autor en HuggingFace: https://huggingface.co/MoshinAli
- Ficha de terceros sobre el modelo: https://savrn.com/models/auralguard-checkpoints
- Figuras del manuscrito incluidas en el repositorio: `figures/cross_domain_comparison.png`, `figures/det_curve.png`, `figures/ci_forest_plot.png`, `figures/calibration_vs_discrimination.png`, `figures/reliability.png`
- Conjuntos de datos referenciados: ASVspoof 2019, In-the-Wild, WaveFake (enlaces especificos no incluidos en la informacion proporcionada)
