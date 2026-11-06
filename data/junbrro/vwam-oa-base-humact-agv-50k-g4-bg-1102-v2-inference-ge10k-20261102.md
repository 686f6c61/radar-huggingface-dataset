# junbrro/vwam-oa-base-humact-agv-50k-g4-bg-1102-v2-inference-ge10k-20261102

## Resumen

vwam-oa-base-humact-agv-50k-g4-bg-1102-v2 es un checkpoint de inferencia publicado por el usuario junbrro dentro de una ejecución de entrenamiento propia sobre el stack V-WAM (Vision-World Action Model) aplicado a OpenArm, una plataforma robótica de código abierto. No se trata de un modelo de lenguaje al uso, sino de un conjunto de pesos para políticas robóticas que combina un VLM congelado como backbone con módulos de acción y un VAE, tal como se deduce de las dependencias de runtime descritas en la model card.

El repositorio contiene cinco exportaciones independientes de inferencia correspondientes a los pasos 13000, 14000, 15000, 16000 y 17000 de un entrenamiento con EMA (Exponential Moving Average) de los pesos. Los pesos se han mapeado de `net_ema.*` a `net.*` y convertidos al dtype de servicio mediante el script `export_eval_minimal.py` del propio framework V-WAM, preservando el formato nativo PyTorch DCP (Distributed Checkpoint) en lugar de safetensors o un formato compatible con `AutoModel` de Transformers.

Su relevancia es acotada: se trata de un artefacto de backup reproducible de una ejecución de investigación en robótica, con 160 GB de tamaño, cero descargas y sin model card sustantiva sobre capacidades, datos de entrenamiento o resultados. No se publican benchmarks ni reclamaciones de éxito de política, y el propio autor indica que no se hace ninguna afirmación sobre rollout robótico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-WAM (Vision-World Action Model) sobre OpenArm; VLM congelado + VAE + módulos de acción (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados en dtype de servicio nativo, sin cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch DCP (Distributed Checkpoint); no es safetensors ni `AutoModel` de Transformers |

## Arquitectura y entrenamiento

La arquitectura corresponde al stack V-WAM, un modelo de acción visual (Vision-World Action Model) orientado a robótica y desplegado sobre la plataforma OpenArm. Según la model card, el modelo depende en runtime de activos congelados upstream: un VLM, un tokenizer y un VAE referenciados por la configuración original. Los pesos publicados son únicamente los del módulo entrenado (mapeados desde `net_ema.*` a `net.*`), sin incluir el estado del optimizador, el scheduler ni el trainer.

El entrenamiento se realizó sobre una ejecución propia del autor, identificada en el nombre como `humact-agv-50k-g4-bg-1102-v2`, con un total de al menos 17000 pasos registrados (se exportan los pasos 13000 a 17000 en intervalos de 1000). Se aplicó EMA sobre los pesos antes de la exportación. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. Cada exportación verifica nombres, formas, dtypes y valores muestreados de los tensores, así como tamaños y hashes de los ficheros del Hub, antes de publicar el marcador `HF_INFERENCE_COMPLETE.json`.

## Capacidades

- Política de acción robótica para la plataforma OpenArm, entrenada dentro del framework V-WAM.
- Inferencia por checkpoint: cada carpeta `step-NNNNNN` es una exportación independiente y utilizable solo tras la aparición de su marcador `HF_INFERENCE_COMPLETE.json`.
- Integración con un VLM congelado upstream para la componente visual (percepción), más un VAE y un tokenizer como dependencias de runtime.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales (thinking, visión general, audio) más allá del pipeline de robótica declarado.

## Casos de uso

- Reanudación de experimentos de investigación en robótica: cargar una carpeta `step-NNNNNN` con su `config.yaml`, `normalization.json` y la ruta `checkpoints/iter_XXXXXXXXX` en el runtime V-WAM para continuar la evaluación desde un punto intermedio del entrenamiento.
- Comparación de checkpoints intermedios: los cinco pasos exportados (13000 a 17000) permiten estudiar la evolución de la política a lo largo del entrenamiento sin necesidad de reentrenar.
- Reproducibilidad de una ejecución propia: el repositorio actúa como backup versionado con verificación de hashes y marcadores de completitud, útil para auditoría interna del entrenamiento.
- Evaluación offline en simulación o laboratorio: al no haber reclamación de éxito de rollout, el uso natural es la evaluación controlada con el runtime V-WAM antes de cualquier despliegue físico.
- Base para fine-tuning posterior sobre OpenArm: los pesos EMA exportados pueden servir como inicialización para nuevas ejecuciones, siempre que se disponga de los activos congelados (VLM, tokenizer, VAE) referenciados por la configuración.
- Integración en pipelines de investigación con GPU: el formato DCP nativo encaja con flujos de PyTorch distribuido, lo que facilita su carga en entornos de entrenamiento existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se realiza ninguna afirmación de éxito de política ni de rollout robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 160 GB, pero ese tamaño incluye cinco exportaciones y no equivale a la huella de un único checkpoint en memoria.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar que quepa en RTX 4090 u otras consumer.
- Opciones de despliegue: runtime V-WAM con `export_eval_minimal.py` y carga de DCP nativo; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas robóticas V-WAM sobre OpenArm u otras plataformas), ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni esperarse capacidades de texto, código o razonamiento general.
- Formato propietario del framework: los pesos están en PyTorch DCP y requieren el runtime V-WAM; no son cargables con `AutoModel` de Transformers ni con safetensors estándar.
- Dependencias externas obligatorias: el VLM, tokenizer y VAE congelados referenciados por la config original deben estar disponibles en runtime; sin ellos el checkpoint no es funcional.
- Rutas de entrenamiento codificadas: la model card advierte que las rutas registradas pueden necesitar sobrescritura en otra máquina.
- Uso de checkpoints incompletos: solo debe usarse una carpeta tras la aparición de su `HF_INFERENCE_COMPLETE.json`.
- Sin licencia declarada: la ausencia de licencia impide determinar condiciones de uso comercial; debe tratarse como no apto para producción comercial hasta aclaración del autor.
- Sin validación de política: el autor no reclama éxito de rollout ni rendimiento en robot real; cualquier despliegue físico requiere evaluación propia.
- Sesgos y alucinación: no documentados en la información disponible; en un modelo de acción el riesgo análogo es la ejecución de acciones no válidas, que debe mitigarse con salvaguardas externas.
- Idiomas y contexto: no disponibles; no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Cero tracción comunitaria (0 descargas, 0 likes) y ausencia de documentación técnica sustantiva: la madurez del artefacto es baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junbrro/vwam-oa-base-humact-agv-50k-g4-bg-1102-v2-inference-ge10k-20261102
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos del framework V-WAM ni de la plataforma OpenArm.
