# shubhambhatee/cnn-transformer-baseline

## Resumen

cnn-transformer-baseline es un prototipo de investigación publicado por el usuario shubhambhatee en HuggingFace. Se trata de una implementación propia de una arquitectura híbrida que combina capas convolucionales (CNN) con mecanismos de atención tipo transformer, orientada nominalmente a tareas de generación. El repositorio se presenta explícitamente como un punto de partida experimental y no como un modelo entrenado: el fichero `model.safetensors` es una inicialización válida para pruebas de humo, no un checkpoint con pesos aprendidos.

El dato más relevante para evaluarlo es su tamaño real: 49.600 parámetros totales, según el fichero safetensors. Aunque la configuración etiqueta la escala como "xlarge", el recuento efectivo de parámetros corresponde a un modelo minúsculo, muy por debajo de cualquier modelo de lenguaje utilizable en producción. El autor no reclama ninguna métrica de rendimiento ni benchmark, y advierte que la implementación no ha sido auditada en robustez, equidad ni transferencia de dominio.

Por tanto, su relevancia actual es exclusivamente como material de referencia arquitectónica, plantilla de código reproducible y baseline para experimentos controlados. No debe confundirse con un modelo desplegable para generación de texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida CNN + transformer) |
| Parametros totales | 49.600 (dato real, safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como "Cnn Transformer" de escala nominal xlarge, con atención multi-query (multi query attention), fusión bilinear, función de activación swish y normalización mediante layernorm. El repositorio incluye `config.json` con los ajustes de arquitectura generados, `training_args.json` con la receta de experimento por defecto y `pipeline.py` como artefacto principal ejecutable. La receta por defecto emplea el optimizador lamb con un schedule de tipo step, aunque el autor subraya que son valores de partida del script y no evidencia de un entrenamiento completado.

No se documenta ningún proceso de entrenamiento efectivo: no se indica número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. El checkpoint es una inicialización aleatoria (o cuasi aleatoria) válida para pruebas de humo, no un modelo con conocimiento adquirido. La innovación declarada es la propia combinación CNN-transformer con fusión bilinear, pero no se aportan resultados que demuestren su eficacia frente a alternativas.

## Capacidades

- Generación de texto: la etiqueta del repositorio incluye "generation", pero al tratarse de un checkpoint sin entrenar no produce salidas lingüísticamente coherentes.
- Razonamiento, código y matemáticas: no soportados de forma efectiva por ausencia de entrenamiento.
- Tool calling / function calling: no documentado ni implementado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución de pruebas de humo: sí permite verificar que el pipeline carga y ejecuta con la inicialización incluida.
- Uso como plantilla de investigación: sí, es su función declarada.

## Casos de uso

- Pruebas de humo de infraestructura: el checkpoint permite validar que un pipeline de carga de safetensors, tokenización y forward pass funciona, sin depender de un modelo grande. Adecuado por su tamaño mínimo y su formato estándar.
- Baseline arquitectónico en investigación: sirve como punto de partida reproducible para comparar variantes de fusión CNN-transformer bajo el mismo presupuesto de datos, ajuste y semillas, tal como recomienda el propio autor.
- Andamiaje de experimentos controlados: `config.json` y `training_args.json` documentan una receta completa que puede clonarse y modificarse para estudiar sensibilidad a hiperparámetros (optimizador lamb, schedule step, activación swish).
- Docencia y aprendizaje: útil para ilustrar cómo se estructura un repositorio de modelo en HuggingFace (config, training args, pesos, pipeline) sin la complejidad de un modelo grande.
- Desarrollo de adaptadores de carga personalizados: al ser una implementación propia, exige un adaptador explícito para APIs automáticas, lo que lo convierte en un caso práctico para practicar la integración con librerías genéricas.
- Validación de pipelines de evaluación: permite ensayar el flujo completo de evaluación (conjunto retenido específico de tarea, métrica por tarea, al menos tres semillas) antes de escalar a modelos reales.
- Reproducibilidad de entornos: su tamaño ínfimo facilita adjuntar versiones de entorno y logs de entrenamiento junto a cualquier resultado publicado, según la guía de evaluación del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio repositorio declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM para inferencia: prácticamente despreciable; con 49.600 parámetros, el modelo cabe en cualquier GPU y en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier acelerador (incluso integrado) es más que suficiente; no tiene sentido reservar A100, H100 o RTX 4090 para este modelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: el autor indica que se ejecuta mediante `pipeline.py` (por ejemplo, `python pipeline.py --help`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser una implementación personalizada, requeriría un adaptador explícito para cargarse con APIs genéricas.
- Latencia y throughput estimados: no disponibles. Por el tamaño, la latencia sería mínima, pero no se aportan medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría. Se trata de un prototipo de investigación sin entrenar y de tamaño atípico (49.600 parámetros), por lo que no existe una comparación directa significativa con modelos de generación desplegables.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo funcional de generación.
- No se han auditado robustez, equidad, sesgos ni transferencia de dominio; el autor lo advierte explícitamente.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que el modelo no genera lenguaje coherente; cualquier salida debe considerarse ruido.
- Idiomas soportados: no documentados; el campo de idiomas del repositorio está vacío.
- Longitud de contexto: no documentada; se desconoce la ventana máxima admitida.
- Licencia MIT: permite uso comercial, pero el autor recomienda revisar por separado los términos de las fuentes de datos si se emplea con datasets externos.
- Implementación personalizada: requiere un adaptador explícito para funcionar con APIs de carga automática; no es plug-and-play.
- No apto para producción: sin entrenamiento, sin benchmarks y sin evaluación, no debe utilizarse en ningún flujo real de generación.
- El uso de la etiqueta "xlarge" puede inducir a error: no refleja el tamaño real del modelo (49.600 parámetros).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shubhambhatee/cnn-transformer-baseline
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
