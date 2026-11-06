# sevden123/prism-spectra

## Resumen

PRISM-Spectra es un modelo ONNX de regresion espectral desarrollado por el usuario sevden123. Su funcion es estimar, a partir de un pixel RGB y sus coordenadas cromaticas CIE (x, y), la distribucion de potencia espectral (SPD) completa en 401 bandas entre 380 y 780 nm, con un paso de 1 nm. Es, por tanto, un modelo de estimacion espectral, no un modelo de lenguaje: no genera texto ni razona, sino que produce una curva fisica de luz a partir de una entrada de cinco valores float32.

El modelo se enmarca en el ambito de la iluminacion circadiana y la fotometria. A partir de la SPD estimada, el autor deriva metricas como la iluminancia fotopica, la melanopic EDI (equivalent daylight illuminance) segun CIE S 026, la relacion mp_ratio, el estimulo circadiano CS, el porcentaje de supresion de melatonina y el desplazamiento de fase circadiana, ademas de un nivel de riesgo. Resulta relevante para aplicaciones de diseno de iluminacion, monitorizacion de exposicion luminica en pantallas y estudios de higiene circadiana en tiempo real.

La model card reporta un r2_score de 0,954 y una latencia de 0,35 ms, lo que lo situa como una pieza ligera y desplegable en navegador mediante onnxruntime-web. No se especifican arquitectura interna, numero de parametros ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX de regresion; arquitectura interna no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo no autoregresivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero unico `model.onnx` o `prism.onnx`, sin dependencia de `.data`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Se trata de un modelo ONNX de inferencia pura con una unica entrada `input_rgb_xy` de forma `[batch_size, 5]` que codifica `[R/255, G/255, B/255, x, y]` y una unica salida `output_spd_log` de forma `[batch_size, 401]` que representa `log(SPD + 1e-4)` para longitudes de onda de 380 a 780 nm con paso de 1 nm. El modelo se distribuye como un fichero ONNX autocontenido, sin pesos externos.

El calculo de las metricas circadianas y fotometricas se realiza fuera del modelo, a partir de la SPD reconstruida y de las curvas CIE incluidas en `cie_curves.json` (`v_lambda`, `s_mel_curve`, `melanopic_edi_weights`). No se documentan tokens de entrenamiento, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineacion, que en este dominio no aplican.

## Capacidades

- Estimacion de la distribucion de potencia espectral (SPD) en 401 bandas de 1 nm entre 380 y 780 nm a partir de un pixel RGB y coordenadas cromaticas CIE (x, y).
- Reconstruccion de la SPD real mediante la transformacion inversa `spd = max(0, exp(out_log) - 1e-4)`.
- Calculo derivado de iluminancia fotopica (lux) a partir de la curva `v_lambda`.
- Calculo de melanopic EDI y de la relacion mp_ratio segun CIE S 026.
- Estimacion de estimulo circadiano (CS), porcentaje de supresion de melatonina y desplazamiento de fase circadiana en horas.
- Clasificacion de nivel de riesgo circadiano (en la prueba de referencia: "GÜVENLİ (Düşük)", es decir, seguro/bajo).
- Extraccion de pico de longitud de onda (peak_wavelength_nm) y parametros auxiliares como angular_scale y g_t.
- Ejecucion en navegador mediante onnxruntime-web con CORS habilitado desde la URL de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo generativo.

## Casos de uso

- Diseno de iluminacion circadiana: dado el color de una fuente o pixel de pantalla, el modelo estima la SPD y permite calcular melanopic EDI y supresion de melatonina para evaluar si una instalacion es adecuada para uso diurno o nocturno.
- Monitorizacion de exposicion luminica en pantallas: integrado en un pipeline de captura de pantalla o analisis de imagen, permite estimar en tiempo real la carga circadiana que recibe un usuario frente a un monitor.
- Aplicaciones web de higiene del sueno: al ejecutarse en navegador con onnxruntime-web y una latencia de 0,35 ms, puede incorporarse a herramientas que recomienden ajustes de color de pantalla segun la hora del dia.
- Investigacion en cronobiologia: permite generar estimaciones rapidas de SPD y metricas CIE S 026 sobre grandes volumenes de muestras de color sin necesidad de espectrorradiometro fisico.
- Validacion de calibraciones de camara: comparar la SPD estimada a partir de pixeles RGB con mediciones espectrales reales para detectar desviaciones en la calibracion cromatica.
- Sistemas de iluminacion adaptativa en automocion o interiorismo: uso embebido en controladores que ajustan la temperatura de color de luminarias LED en funcion del objetivo circadiano calculado por el modelo.
- Preprocesado en pipelines de vision: generar caracteristicas espectrales de 401 bandas a partir de imagenes RGB para modelos posteriores de analisis de escena o colorimetria.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en la model card. No se aportan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| r2_score | 0,954 |
| latency_ms | 0,35 |
| bands | 401 |

Resultado de la prueba de referencia aportada por el autor:

| Salida | Valor |
|---|---|
| peak_wavelength_nm | 444,0 |
| angular_scale | 0,9659 |
| g_t | 0,6689 |
| photopic_lux | 52,11 |
| melanopic_edi | 0,87 |
| mp_ratio | 0,0168 |
| circadian_stimulus_cs | 0,0015 |
| melatonin_suppression_pct | 1,23 |
| phase_shift_hours | 0,323 |
| risk_level | GÜVENLİ (Düşük) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeno, probablemente de pocos MB o menos.
- GPU recomendadas: no se especifican; por su perfil (ONNX ligero, 0,35 ms de latencia) es viable en CPU y en GPU de gama baja.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer e incluso en CPU; no se dispone de cifras exactas de memoria.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), y cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime GenAI no aplica por no ser generativo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 0,35 ms por inferencia segun el autor; no se especifica el hardware de medida ni el throughput agregado.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de estimacion espectral RGB a SPD con metricas circadianas CIE S 026. La model card no incluye comparaciones con alternativas.

## Limitaciones y advertencias

- La arquitectura interna, el tamano y los datos de entrenamiento no estan documentados, lo que impide evaluar su robustez fuera del dominio de entrenamiento.
- El r2_score de 0,954 es una metrica agregada reportada por el autor; se desconoce el conjunto de validacion, su composicion y su representatividad.
- El modelo estima SPD a partir de solo cinco valores de entrada (RGB y coordenadas cromaticas); la SPD reconstruida es una estimacion, no una medicion fisica, y puede desviarse en fuentes con distribuciones espectrales no convencionales (LED con picos estrechos, fluorescencia, etc.).
- Las metricas circadianas derivadas (melanopic EDI, CS, supresion de melatonina, phase_shift_hours) dependen de las curvas CIE incluidas y de las formulas aplicadas por el autor, que no se detallan; no deben tratarse como equivalentes a una medicion con espectrorradiometro certificado.
- La salida se entrega en escala logaritmica (`log(SPD + 1e-4)`); un uso incorrecto de la transformacion inversa puede producir valores negativos o distorsiones.
- El modelo no es linguistico ni generativo: no soporta texto, codigo, tool calling ni agentes, por lo que no debe evaluarse con benchmarks de LLM.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no se ofrece garantia alguna sobre la precision de las estimaciones.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican en el sentido habitual; el riesgo principal es la extrapolacion a condiciones de iluminacion fuera del dominio de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sevden123/prism-spectra
- Fichero ONNX directo: https://huggingface.co/sevden123/prism-spectra/resolve/main/model.onnx
- Curvas CIE: `cie_curves.json` en el repositorio (https://huggingface.co/sevden123/prism-spectra)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
