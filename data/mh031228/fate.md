# mh031228/FATE

## Resumen

FATE es un adaptador de deteccion de imagenes generadas por IA construido sobre el modelo vision-lenguaje Qwen3-VL-8B-Instruct. Lo desarrolla el autor independiente mh031228 (repositorio de codigo asociado a Mingheng-Zheng) y se publica como un conjunto de checkpoints de investigacion: un modelo maestro ("HH teacher") y un adaptador/clasificador FATE seleccionado, junto con su configuracion. No es un modelo completo: los pesos congelados del backbone Qwen no se incluyen y deben descargarse por separado desde el repositorio oficial de Qwen.

El modelo resuelve una tarea concreta: clasificar si una imagen ha sido generada por un modelo generativo. Para ello combina un backbone VLM de 8B parametros con un router de frecuencia, modulos LoRA y un clasificador entrenables. La relevancia actual reside en la dificultad creciente de distinguir contenido sintetico del real y en el interes de enfoques que aprovechan las capacidades visuales de un VLM en lugar de entrenar un detector desde cero.

La publicacion es de caracter marcadamente investigador: el repositorio ocupa unos 0,1 GB, no incluye estados del optimizador ni registros privados, y la propia model card advierte de que no se afirma ninguna metrica entre conjuntos de datos y de que la evaluacion publica se limita a GAN-Test/ProGAN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (LoRA + router de frecuencia + clasificador) sobre backbone VLM Qwen3-VL-8B-Instruct |
| Parametros totales | No disponible para el adaptador; el backbone base Qwen3-VL-8B-Instruct tiene 8B (no incluido en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card menciona "English-evidence" para el checkpoint) |
| Licencia | MIT (codigo y checkpoints); los pesos del backbone Qwen se rigen por su propia licencia |
| Formato de pesos | PyTorch `.pth` (state dicts): `hh_teacher.pth`, `fate_step62000.pth`, `config.json` |

## Arquitectura y entrenamiento

FATE no es un transformer entrenado desde cero, sino un conjunto de tensores entrenables acoplados a un backbone Qwen3-VL-8B-Instruct congelado. Segun la model card, el checkpoint `fate_step62000.pth` contiene el router de frecuencia, los modulos LoRA y el clasificador correspondientes al paso 62.000 de entrenamiento. El fichero `hh_teacher.pth` contiene los tensores del modelo maestro HH, incluido su clasificador, presumiblemente usado como referencia de destilacion o supervision durante el entrenamiento.

Los checkpoints se exportaron de artefactos de investigacion ya guardados y no se reentrenaron durante el empaquetado. Se omiten el estado del optimizador, rutas especificas de servidor y registros de entrenamiento privados. La model card no detalla el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO; tampoco especifica el volumen de datos de imagenes generadas frente a reales. La seleccion del checkpoint se realizo con un protocolo basado en ProGAN, y el autor advierte de que un protocolo publico distinto podria seleccionar un checkpoint diferente.

## Capacidades

- Clasificacion binaria de imagenes: distingue imagenes generadas por IA de imagenes reales (pipeline `image-classification`).
- Deteccion basada en evidencia visual: el checkpoint se describe como "English-evidence FATE adapter/classifier", lo que sugiere que el modelo razona sobre evidencia textual en ingles antes de clasificar.
- Aprovechamiento de las capacidades del VLM base: al apoyarse en Qwen3-VL-8B-Instruct, hereda la percepcion visual y el razonamiento del backbone (aunque el adaptador solo se entrena para la tarea de deteccion).
- Integracion con el codigo de referencia del repositorio de GitHub para carga de checkpoints y evaluacion.
- No se documentan capacidades de tool calling, agentes, audio ni modos de pensamiento especificos del adaptador.

## Casos de uso

- Moderacion de contenido en plataformas: integrar el clasificador en un pipeline que marque imagenes sospechosas de ser sinteticas antes de la revision humana, usando el codigo de referencia para cargar el checkpoint sobre Qwen3-VL-8B-Instruct.
- Verificacion periodistica: como senal auxiliar (nunca prueba definitiva) para que un redactor priorice que imagenes requieren verificacion adicional antes de publicarlas.
- Investigacion en forense de imagenes: usar el checkpoint y el modelo maestro HH como linea base reproducible para comparar detectores sobre GAN-Test/ProGAN.
- Auditoria de datasets: filtrar o etiquetar imagenes sinteticas en conjuntos de datos de entrenamiento para evitar contaminacion por contenido generado.
- Deteccion en entornos de comercio electronico: marcar imagenes de producto generadas por IA que puedan inducir a engano en fichas de catalogo.
- Experimentacion academica: punto de partida para estudiar tecnicas de adaptacion (LoRA, router de frecuencia) sobre VLMs en tareas de clasificacion visual, reutilizando la configuracion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna metrica entre conjuntos de datos y que el comando de evaluacion publico del repositorio evalua unicamente GAN-Test/ProGAN, escribiendo predicciones por imagen.

## Requisitos de hardware

- El backbone Qwen3-VL-8B-Instruct debe descargarse aparte; en precision BF16 requiere aproximadamente 16 GB de VRAM solo para los pesos del modelo base, mas overhead de activaciones y del adaptador.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia comoda en precision completa; RTX 4090 (24 GB) es viable en BF16 para el backbone de 8B, con margen limitado.
- En GPUs de consumo con menos VRAM seria necesario cuantizar el backbone (por ejemplo, 4 bits), aunque la model card no documenta cuantizaciones soportadas para el adaptador.
- Opciones de despliegue: el repositorio de GitHub proporciona el codigo de carga de checkpoints `.pth`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato `.pth` con modulos personalizados complica su uso en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FATE (este modelo) | Adaptador sobre 8B | No disponible | Deteccion de imagenes IA | MIT (adaptador) | Checkpoints `.pth` en HF; backbone aparte |
| Qwen3-VL-8B-Instruct | 8B | No disponible en la informacion | VLM generalista | Licencia Qwen | Repositorio oficial de Qwen |
| Detectores GAN especializados (genericos) | Variable | No aplica | Deteccion de imagenes IA | Variable | No disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre FATE y alternativas; la model card no publica metricas.

## Limitaciones y advertencias

- El modelo es de investigacion y puede fallar ante generadores desconocidos o perturbaciones de imagen; sus salidas no constituyen prueba del origen de una imagen.
- No se afirma ninguna metrica entre conjuntos de datos; la evaluacion publica se limita a GAN-Test/ProGAN, lo que limita las garantias de generalizacion.
- El checkpoint seleccionado depende del protocolo ProGAN; otro protocolo de seleccion podria elegir un checkpoint distinto.
- Los pesos del backbone Qwen no se incluyen y su licencia no queda cubierta por la licencia MIT del proyecto; los derechos sobre imagenes de origen y modelo base no se sustituyen.
- Solo deben cargarse checkpoints de confianza: los ficheros `.pth` son state dicts de PyTorch y su carga implica ejecutar codigo asociado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion del backbone VLM subyacente no evaluado para esta tarea.
- Idiomas soportados no especificados; el checkpoint se describe como basado en evidencia en ingles.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mh031228/FATE
- Codigo y uso: https://github.com/Mingheng-Zheng/FATE
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
