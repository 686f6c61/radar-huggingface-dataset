# elnmax/kd-oad-encoders

## Resumen

KD-OAD Encoders es un conjunto de pesos preentrenados para deteccion de acciones en linea (online action detection, OAD) en video, publicado por el autor elnmax (equipo del articulo de Rybka et al., 2026). El paquete incluye dos componentes: encoders student compactos basados en X3D XS (3,0 M de parametros) que consumen unicamente fotogramas RGB, y cabezas de deteccion TeSTra entrenadas sobre las caracteristicas de esos encoders. El modelo resuelve el problema de desplegar OAD en tiempo real sin depender de dos flujos pesados (apariencia ResNet-50 y movimiento BN-Inception con flujo optico), que es el esquema del TeSTra original.

La propuesta tecnica es una destilacion de conocimiento en dos etapas: primero se entrena el encoder student X3D XS para imitar las caracteristicas del profesor (ResNet-50 + BN-Inception), y despues se entrena la cabeza TeSTra sobre las caracteristicas del student anadiendo destilacion de logits desde el modelo profesor. El resultado son checkpoints especificos por dataset: THUMOS14 y TVSeries. La relevancia actual esta en la reduccion de coste computacional para OAD: un encoder de 3 M de parametros que solo necesita RGB elimina la necesidad de calcular flujo optico en produccion.

El repositorio tiene 0,6 GB, licencia MIT para pesos y codigo propio (el componente TeSTra es Apache 2.0), y se distribuye como pesos PyTorch (`.pt` para encoders, `.pth` para cabezas). No es un modelo generativo ni un LLM: es un pipeline de vision por video para clasificacion/deteccion temporal de acciones, con pipeline_tag `video-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder X3D XS (student) + cabeza TeSTra (online action detection) |
| Parametros totales | 3,0 M (encoder X3D XS); cabeza TeSTra: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal de video, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos y codigo propio); TeSTra: Apache 2.0 |
| Formato de pesos | PyTorch (`.pt` encoders, `.pth` cabezas TeSTra) |

## Arquitectura y entrenamiento

El pipeline combina un encoder de video X3D XS (variante extra-small de la familia X3D, solo RGB) con la cabeza de deteccion online TeSTra. El profesor original de TeSTra usa dos flujos: ResNet-50 para apariencia y BN-Inception para movimiento a partir de flujo optico. El student elimina el flujo optico y trabaja solo con fotogramas RGB, lo que reduce drasticamente el coste de preprocesado en inferencia.

El entrenamiento es una destilacion en dos etapas. En la etapa 1, el encoder X3D XS se entrena para que sus caracteristicas coincidan con las del profesor (feature KD). En la etapa 2, la cabeza TeSTra se entrena sobre las caracteristicas del student con destilacion de logits adicional desde el TeSTra profesor. Se publican checkpoints separados por dataset: `thumos_x3d.pt` y `thumos_testra.pth` para THUMOS14; `tvseries_x3d.pt` y `tvseries_testra.pth` para TVSeries. No se especifican en la informacion el numero de tokens/fotogramas de entrenamiento ni la composicion exacta del dataset mas alla de los dos benchmarks citados.

## Capacidades

- Deteccion de acciones en linea (OAD) sobre video: identifica la accion en curso en cada fotograma sin acceso al futuro de la secuencia.
- Clasificacion de video a nivel de intervalo mediante la cabeza TeSTra.
- Procesamiento exclusivamente RGB: no requiere flujo optico ni entrada multimodal.
- Encoder compacto (3,0 M de parametros) apto para extraccion de caracteristicas de video en tiempo real.
- Checkpoints especializados por dominio: THUMOS14 (acciones deportivas/generales) y TVSeries (series de television).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de vision, no un LLM.
- No dispone de capacidades multilingues ni de generacion de texto.

## Casos de uso

- Deteccion de acciones en directo en retransmisiones deportivas: el encoder RGB de 3 M de parametros permite procesar el flujo en tiempo real sin calcular flujo optico, identificando la accion en curso fotograma a fotograma con la cabeza TeSTra.
- Vigilancia y analitica de video en edge: al prescindir del flujo optico y usar un encoder X3D XS, el pipeline puede desplegarse en dispositivos con recursos limitados para detectar eventos (caidas, intrusiones, gestos) en streaming.
- Etiquetado asistido de video para anotacion: la salida de TeSTra sobre las caracteristicas del student sirve para preanotar intervalos de acciones en THUMOS14 o dominios similares y acelerar el trabajo de anotadores humanos.
- Investigacion en destilacion de conocimiento: los checkpoints permiten reproducir el procedimiento de dos etapas (feature KD + logit KD) y comparar con el profesor ResNet-50 + BN-Inception en nuevos datasets.
- Analisis de contenido audiovisual (series de television): el checkpoint de TVSeries esta especializado en deteccion de acciones en escenas de ficcion, util para indexado semantico y busqueda por eventos.
- Benchmarking de OAD: servir como linea base compacta (65,9 % mAP en THUMOS14, 86,0 % mcAP en TVSeries) para evaluar nuevos encoders o cabezas de deteccion en linea.
- Sistemas de recomendacion y resumen de video: la deteccion temporal de acciones permite segmentar contenido y generar capitulos o clips destacados.

## Benchmarks y rendimiento

| Dataset | Metrica | Mejor semilla | Media 10 ejecuciones |
|---|---|---|---|
| THUMOS14 | mAP | 66,3 % | 65,9 ± 0,2 % |
| TVSeries | mcAP | 86,2 % | 86,0 ± 0,1 % |

No se han publicado en la informacion disponible resultados comparativos frente al profesor (ResNet-50 + BN-Inception) ni frente a otros metodos de OAD.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Con 3,0 M de parametros en el encoder, el peso en FP32 es de aproximadamente 12 MB, por lo que la VRAM dominante la determina la cabeza TeSTra y el buffer temporal de caracteristicas.
- GPU recomendadas: no especificadas. Por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente; el cuello de botella real es el preprocesado de video, no el modelo.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con suficiente memoria para el pipeline de video; no se aportan cifras oficiales.
- Opciones de despliegue: el repositorio oficial usa PyTorch con los scripts de `testra/scripts/test_checkpoint.sh` y el paquete `kdoad`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros encoder | Entrada | THUMOS14 mAP | TVSeries mcAP | Licencia |
|---|---|---|---|---|---|
| KD-OAD Encoders (este) | 3,0 M (X3D XS) | RGB | 65,9 ± 0,2 % | 86,0 ± 0,1 % | MIT / Apache 2.0 (TeSTra) |
| TeSTra original (profesor) | ResNet-50 + BN-Inception | RGB + flujo optico | no disponible en la informacion | no disponible en la informacion | Apache 2.0 |
| Otros metodos OAD | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados numericos del profesor ni de alternativas comparables para completar la tabla con datos verificables.

## Limitaciones y advertencias

- Modelo de vision especializado: no genera texto, no razona y no soporta instrucciones en lenguaje natural; no debe evaluarse como un LLM.
- Especifico por dataset: los checkpoints estan entrenados para THUMOS14 y TVSeries; su rendimiento fuera de esos dominios no esta documentado.
- Dependencia del preprocesado: requiere exportar caracteristicas X3D de los videos siguiendo el README del repositorio; no es un pipeline listo para usar de extremo a extremo.
- Los targets per-frame de TeSTra no se incluyen en el repo de Hugging Face: para THUMOS14 hay que descargarlos aparte y para TVSeries generarlos con `generate_target_perframe.sh`.
- Los videos no se redistribuyen; es necesario obtener THUMOS14 y TVSeries de sus paginas oficiales y respetar sus condiciones de uso.
- Riesgo de confusion entre acciones visualmente similares y sensibilidad a la calidad del video (resolucion, compresion, iluminacion), inherente a los metodos de OAD; no se documentan sesgos especificos.
- Licencia MIT para pesos y codigo propio, pero el componente TeSTra es Apache 2.0: conviene revisar ambas antes de uso comercial.
- Sin datos publicados de latencia, throughput ni consumo de VRAM; es necesario medirlos en el hardware objetivo antes de un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/elnmax/kd-oad-encoders
- Codigo: https://github.com/sag111/kd-oad-encoders
- Paper: https://doi.org/10.3390/technologies14120796
- Paper (MDPI): https://www.mdpi.com/2227-7080/14/12/796
- TeSTra (repositorio original): https://github.com/zhaoyue-zephyrus/TeSTra
- Dataset THUMOS14: https://www.crcv.ucf.edu/THUMOS14/
- Dataset TVSeries: https://homes.esat.kuleuven.be/psi-archive/rdegeest/TVSeries.html
