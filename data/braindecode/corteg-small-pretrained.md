# braindecode/corteg-small-pretrained

## Resumen

CORTEG-small-pretrained es un checkpoint de inicialización publicado por el proyecto Braindecode para el modelo `braindecode.models.CORTEG`, un modelo fundacional orientado a registros intracraneales (iEEG y ECoG) descrito en Yang et al. (NeurIPS 2026). No se trata de un modelo entrenado para predicción directa, sino del backbone ST-EEGFormer small adaptado de señales de cuero cabelludo a registros intracraneales, con 25,3 millones de parámetros y licencia MIT. Su función es servir como punto de partida reproducible para el ajuste fino que propone el artículo.

El checkpoint contiene únicamente el encoder preentrenado: el adaptador espacial, la cabeza de salida y, opcionalmente, la compuerta de fusión por capas no están incluidos y los inicializa Braindecode al cargar el modelo. El autor indica explícitamente que estos ficheros no contienen ningún componente intracraneal entrenado, por lo que el modelo requiere entrenamiento antes de poder predecir.

Su relevancia es metodológica: permite reproducir la transferencia de representación entre modalidades (de EEG de superficie a iEEG/ECoG) sin depender de pesos propietarios, y valida la conversión numérica del embedding de alta frecuencia gamma (interpolación lineal de 16 a 25 muestras) con coincidencia exacta en float32 sobre CPU respecto a la implementación de los autores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ST-EEGFormer small (encoder transformer) adaptado a iEEG/ECoG; modelo CORTEG en Braindecode |
| Parametros totales | 25.316.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la entrada se define por `n_times` (p. ej. 128 muestras) y `chs_info` |
| Tipos de cuantizacion | no disponible (pesos en float32; sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa señales fisiológicas) |
| Licencia | MIT (pesos ST-EEGFormer de Liuyin Yang); código de Braindecode bajo BSD-3-Clause |
| Formato de pesos | safetensors (repo con `pytorch_model_hub_mixin`); checkpoint original `checkpoint-300.pth` |

## Arquitectura y entrenamiento

El modelo es un encoder tipo transformer (ST-EEGFormer small) preentrenado originalmente sobre EEG de cuero cabelludo y adaptado a registros intracraneales dentro del marco CORTEG. La adaptación añade un patch embedding de alta frecuencia gamma que el modelo de superficie no posee; este embedding se inicializa en caliente a partir del de baja frecuencia mediante interpolación lineal de 16 a 25 muestras, siguiendo la función `build_model` de los autores. La conversión está reproducible con el script `convert_corteg_checkpoint.py` incluido en el repositorio y se verificó con error 0.0e+00 en float32 sobre CPU frente a la implementación de referencia.

El checkpoint parte de `checkpoint-300.pth` (SHA-256 `98d2848abdaea7a143d399c07f67f8782e07dd66e7c309ddb058c7158a8a8b02`) convertido a `braindecode/STEEGFormer-small` en la revisión `633c9c0d`. El protocolo de entrenamiento descrito en la model card, que no está aplicado en estos pesos, congela el backbone y entrena el adaptador espacial, el embedding de alta gamma, LoRA (r=4, alpha=16) sobre los últimos cuatro bloques con sus LayerNorms, y la cabeza de salida. No se especifican en la información disponible el volumen de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Extracción de características sobre señales intracraneales (iEEG, ECoG) mediante el pipeline `feature-extraction`.
- Punto de partida para ajuste fino con LoRA sobre los últimos bloques del encoder.
- Integración nativa con `braindecode.models.CORTEG` y carga vía `from_pretrained` con `n_outputs`, `n_times` y `chs_info`.
- Inicialización automática del adaptador espacial a partir de las posiciones de electrodos en metros (`chs_info`).
- Soporte de estrategia de fusión `merge_strategy="layerwise_gate"` con compuerta inicializada en carga.
- No incluye generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo de señales neuronales.
- No realiza predicciones sin entrenamiento previo de los componentes intracraneales.

## Casos de uso

- Investigación en decodificación de iEEG/ECoG: cargar el checkpoint con `CORTEG.from_pretrained` y ajustar el adaptador, el embedding de alta gamma, LoRA y la cabeza para tareas de regresión o clasificación sobre registros intracraneales, aprovechando que el backbone queda congelado y el coste de entrenamiento se reduce.
- Reproducción de resultados del artículo CORTEG: el script de conversión y el SHA-256 permiten verificar que los pesos coinciden con los de los autores antes de replicar sus experimentos.
- Transferencia entre modalidades: usar representaciones aprendidas en EEG de superficie como inicialización para datasets intracraneales con pocos sujetos, mitigando el sobreajuste en corpus pequeños.
- Prototipado rápido en Braindecode: validar arquitecturas y pipelines de preprocesado con un backbone preentrenado de 25,3 M de parámetros que cabe en cualquier GPU de consumo.
- Comparación de estrategias de ajuste: evaluar LoRA (r=4, alpha=16) frente a ajuste completo de capas selectivas sobre el mismo backbone, con la ventaja de que el checkpoint base es idéntico y verificable.
- Base para modelos derivados: el modelo entrenado de los autores está publicado como `braindecode/corteg-stanford-pooled`, de modo que este checkpoint sirve para generar variantes propias con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 25,3 M de parámetros (unos 101 MB de pesos), más el estado de activaciones según `n_times` y número de canales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; no se requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también es viable en CPU para extracción de características.
- Opciones de despliegue: Braindecode sobre PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| braindecode/corteg-small-pretrained | 25,3 M | definido por `n_times` y canales | iEEG/ECoG (adaptado desde EEG) | MIT | Checkpoint base, requiere entrenamiento |
| braindecode/corteg-stanford-pooled | no disponible | no disponible | iEEG/ECoG | no disponible | Modelo entrenado por los autores |
| braindecode/STEEGFormer-small | no disponible | no disponible | EEG de superficie | MIT (pesos originales) | Backbone de origen, sin adaptación intracraneal |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Los ficheros no contienen ningún componente intracraneal entrenado: el modelo no puede predecir sin un ajuste fino previo.
- El adaptador espacial, la cabeza y la compuerta no están en el repositorio; se inicializan al cargar y su comportamiento depende de `chs_info` correctamente especificado en metros.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-step.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática, al no aplicar a su dominio.
- La licencia MIT cubre los pesos de ST-EEGFormer; el código de Braindecode es BSD-3-Clause y conviene revisar ambas condiciones en uso comercial.
- El uso clínico o diagnóstico no está validado en la información disponible; se trata de un artefacto de investigación.
- La reproducibilidad depende de la revisión `633c9c0d` del checkpoint convertido y del SHA-256 indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braindecode/corteg-small-pretrained
- Modelo base convertido: https://huggingface.co/braindecode/STEEGFormer-small
- Modelo entrenado por los autores: https://huggingface.co/braindecode/corteg-stanford-pooled
- Artículo CORTEG (NeurIPS 2026): https://arxiv.org/abs/2605.10337
- Documentación de `braindecode.models.CORTEG`: https://braindecode.org/stable/generated/braindecode.models.CORTEG.html
- Repositorio CORTEG de los autores: https://github.com/LiuyinYang1101/CORTEG
- Repositorio STEEGFormer: https://github.com/LiuyinYang1101/STEEGFormer
- Checkpoint original `checkpoint-300.pth`: https://github.com/LiuyinYang1101/STEEGFormer/releases/download/ST-EEGFormer-small/checkpoint-300.pth
- Braindecode (documentación principal): https://braindecode.org/stable/index.html
- Braindecode en Hugging Face: https://huggingface.co/braindecode/models
