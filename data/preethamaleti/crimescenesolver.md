# preethamaleti/crimescenesolver

## Resumen

SceneSolver (publicado en Hugging Face como `preethamaleti/crimescenesolver`) es un checkpoint de CLIP ViT-B/32 afinado para clasificacion de incidentes en video de vigilancia. Sobre la torre visual y el proyector multimodal de `openai/clip-vit-base-patch32`, el autor ha entrenado una cabeza de clasificacion lineal que distingue seis clases: robo, explosion, hurto en tienda, tiroteo, pelea y accion normal. El objetivo declarado es el triaje automatizado de CCTV y el etiquetado de evidencia forense.

El modelo se entrena con el benchmark UCF-Crime (Sultani et al., CVPR 2018), un corpus de videos de vigilancia reales sin recortar, muestreados a 64 keyframes temporales por incidente y anotados con descripciones forenses a nivel de fotograma. El repositorio incluye `best_model.pth` (849 MB, state dict de PyTorch con los parametros de proyeccion visual y la cabeza lineal) y `label_encoder.pt` (1,8 KB, un `LabelEncoder` de scikit-learn que mapea los logits a etiquetas categoricas).

Es relevante como ejemplo de reutilizacion de un modelo vision-lenguaje generalista para una tarea vertical de seguridad, pero conviene tratarlo con cautela: el repositorio no publica metricas de evaluacion, no tiene descargas ni likes, y la propia model card advierte de que el rendimiento puede degradarse con poca luz, distorsion de lente u oclusion. La licencia MIT facilita la experimentacion, aunque el uso en flujos legales exige verificacion humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (transformer visual + proyector multimodal) con cabeza de clasificacion lineal |
| Parametros totales | no disponible (el checkpoint `best_model.pth` ocupa 849 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa imagenes/fotogramas individuales; el muestreo es de 64 keyframes por incidente, no una ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en punto flotante PyTorch) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pth`), mas `label_encoder.pt` |

## Arquitectura y entrenamiento

La base es CLIP ViT-B/32: un Vision Transformer con parches de 32x32 que produce embeddings de imagen alineados con embeddings de texto en un espacio comun. El autor parte de los pesos preentrenados de OpenAI y afina los parametros de proyeccion visual junto con una cabeza de clasificacion lineal de seis clases. El checkpoint se carga con `strict=False` sobre `CLIPModel.from_pretrained`, lo que indica que solo una parte del state dict se sobrescribe con los pesos afinados.

El entrenamiento usa el UCF-Crime Dataset, con videos de vigilancia reales sin recortar. Cada incidente se muestrea a 64 keyframes temporales y se empareja con anotaciones densas de caption forense a nivel de fotograma. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, la funcion de perdida ni si hubo RLHF o DPO (no aplicable en un clasificador de imagenes). Tampoco se detalla ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de imagenes/fotogramas de vigilancia en seis categorias: robo, explosion, hurto en tienda, tiroteo, pelea y accion normal.
- Extraccion de evidencia forense a partir de captions a nivel de fotograma (segun la model card).
- Procesamiento multimodal: al heredar CLIP, dispone de torre de texto y de imagen, aunque el uso documentado es la clasificacion visual.
- Triaje automatizado de secuencias de CCTV muestreadas a 64 keyframes por incidente.
- Generacion de informes forenses de video (declarado como caso de uso principal).
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning ni modo thinking.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Triaje de CCTV en centros de control: el modelo puede clasificar fotogramas clave de un flujo de vigilancia en las seis categorias y priorizar la revision humana de los incidentes marcados como robo, tiroteo o explosion.
- Etiquetado de evidencia forense: integrado en un pipeline que muestrea 64 keyframes por incidente, permite generar etiquetas categoricas consistentes para archivos de video largos antes de la revision por un analista.
- Filtrado previo en investigaciones: reducir el volumen de horas de grabacion descartando segmentos clasificados como accion normal y concentrando el esfuerzo en los positivos.
- Prototipado academico en vision por computador: servir de linea base afinada sobre CLIP para experimentos de deteccion de anomalias con UCF-Crime.
- Sistemas de alerta en comercio minorista: detectar patrones de hurto en tienda en secuencias de camaras, con verificacion humana obligatoria antes de cualquier accion.
- Analisis post-incidente: clasificar retroactivamente grabaciones aportadas como evidencia para apoyar la categorizacion inicial del suceso.
- Demo o prueba de concepto de clasificacion multimodal: al cargarse con `transformers` y `huggingface_hub`, es sencillo integrarlo en notebooks y servicios de inferencia basicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa 849 MB en punto flotante, por lo que la huella en memoria es moderada (del orden de 1-2 GB incluyendo el modelo base CLIP ViT-B/32 y el procesador).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM deberia bastar para inferencia en fp32; se puede ejecutar tambien en CPU segun el codigo de ejemplo (`cuda` si esta disponible, si no `cpu`).
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores; no se han publicado mediciones concretas.
- Opciones de despliegue: el codigo de ejemplo usa `transformers` (`CLIPModel`, `CLIPProcessor`) y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje y este es un clasificador visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneSolver (`preethamaleti/crimescenesolver`) | no disponible (checkpoint de 849 MB) | no aplica (clasificacion por fotograma) | Clasificacion de anomalias en CCTV (6 clases) | MIT | Hugging Face, 0 descargas |
| `openai/clip-vit-base-patch32` | no disponible en la informacion | no aplica | Vision-lenguaje generalista (zero-shot) | MIT (segun el modelo base) | Hugging Face, ampliamente usado |
| Otros modelos afinados sobre UCF-Crime | no disponible | no disponible | Deteccion de anomalias en vigilancia | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican metricas de evaluacion (precision, recall, F1) sobre UCF-Crime ni sobre ningun otro conjunto; el rendimiento real es desconocido.
- La model card advierte de degradacion con poca luz, distorsion extrema de lente u oclusion severa de camara.
- Riesgo de falsos positivos y negativos en un dominio sensible: clasificar erróneamente una situacion como tiroteo o explosion puede tener consecuencias graves; se recomienda verificacion humana en el bucle.
- Sesgos potenciales derivados del dataset UCF-Crime (videos reales de vigilancia con distribucion geografica y de escenarios concreta); no se documenta ningun analisis de sesgo.
- Solo soporta ingles en las etiquetas y captions; no hay capacidades multilingues.
- Uso comercial permitido por la licencia MIT, pero el uso legal o investigativo exige supervision humana segun la propia model card.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (27 de noviembre de 2026): no hay evidencia de uso en produccion ni de validacion independiente.
- La carga con `strict=False` implica que parte del state dict podria no coincidir con la arquitectura base; conviene verificar que los pesos se aplican correctamente antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/preethamaleti/crimescenesolver
- Repositorio GitHub asociado: https://github.com/preethamaleti/CrimeSceneSolver
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Dataset UCF-Crime (pagina del proyecto): https://www.crcv.cs.ucf.edu/research/projects/real-world-anomaly-detection-in-surveillance-videos/
- Paper de referencia: Sultani, W., Chen, C., & Shah, M. "Real-world Anomaly Detection in Surveillance Videos", CVPR 2018.
