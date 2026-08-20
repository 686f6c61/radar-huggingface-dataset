# NikitaLosev/steering-denoiser-gpt2

## Resumen

`steering-denoiser-gpt2` es un modelo de interpretabilidad desarrollado por NikitaLosev que corrige las activaciones del residual stream de GPT-2 small cuando se aplica activation steering. El steering es una técnica de control de generación que desplaza las activaciones ocultas a lo largo de una dirección semántica (`h + αv`), pero suele degradar la coherencia del texto. Este modelo, un denoizador de rango uno entrenado con 11,7 millones de parámetros, repara esas activaciones intervenidas para preservar la fluidez del lenguaje mientras mantiene el efecto del steering.

El denoizador se aplica a la salida del bloque 6 de GPT-2 small y utiliza direcciones extraídas del SAE de OpenAI `resid_post_mlp_v5_32k`. No es un modelo de lenguaje completo, sino un módulo auxiliar que se conecta mediante un hook al flujo de activaciones. Su relevancia radica en que aborda un problema práctico de la interpretabilidad: el steering produce texto incoherente, y este modelo lo corrige con una mejora media de +1,153 en expresividad del rasgo frente al steering crudo, según el informe del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoizador de activaciones de rango uno (no transformer) |
| Parametros totales | 11,7 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (opera sobre activaciones de GPT-2 small, capa 6) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende de GPT-2 base) |
| Licencia | MIT (pesos del denoizador y codigo; GPT-2, SAE y Qwen conservan sus licencias) |
| Formato de pesos | PyTorch `.pt` (carga con `weights_only=True`) |

## Arquitectura y entrenamiento

El modelo es un denoizador de rango uno que toma como entrada un tensor de activaciones de dimension `(batch, 768)` y un escalar de fuerza de distorsión `r = α / ||h||`. La fuerza se codifica mediante un esquema seno-coseno. Se entrenó durante 6000 pasos sobre un millón de activaciones del corpus OpenWebText, con un esquema de ruido que desplaza las activaciones a lo largo de columnas aleatorias del decoder del SAE. El rango de fuerza probado va de 40 a 250, y la décima parte de los ejemplos se mantiene limpia para regularizar.

La intervención y la reparación se aplican solo a la salida del bloque 6 de GPT-2 small. El autor también proporciona un operador de Wiener construido a partir de estadísticas de activaciones (media y espectro de covarianza de la capa 6), sin entrenamiento, que sirve como alternativa basada en estadística. El checkpoint entrenado supera a este operador en la métrica principal con una diferencia pareada de +0,448 ± 0,110 (p = 0,00025).

## Capacidades

- Corrección de activaciones intervenidas en el residual stream de GPT-2 small (capa 6).
- Reducción de la pérdida de coherencia textual inducida por activation steering.
- Mejora de la expresividad del rasgo dirigido a igualdad de `dist_1` (fracción de tokens diferentes respecto al texto sin intervenir).
- Operador de Wiener incluido como alternativa sin entrenamiento, basado en estadísticas de covarianza.
- Soporte de carga mediante hook manual, no requiere `AutoModel.from_pretrained`.
- Compatible con direcciones del SAE OpenAI `resid_post_mlp_v5_32k`.

## Casos de uso

- Investigación en interpretabilidad: permite estudiar cómo las direcciones del SAE afectan la generación de GPT-2 sin que el texto se vuelva incoherente, facilitando análisis causales de los rasgos aprendidos.
- Desarrollo de técnicas de control de generación: sirve como componente en pipelines de steering para mantener la calidad del texto mientras se controla el tema o estilo.
- Evaluación de direcciones de SAE: permite probar direcciones candidatas de un diccionario de rasgos y medir su efecto real sobre la generación con una métrica de coherencia mejorada.
- Benchmark de métodos de reparación de activaciones: el operador de Wiener y el denoizador entrenado pueden compararse como referencias para nuevos enfoques de corrección de intervenciones.
- Docencia y experimentación en interpretabilidad: el código y los pesos son ligeros y fáciles de integrar en notebooks para demostrar el efecto del steering y su reparación.
- Extensión de herramientas de interpretabilidad existentes: puede combinarse con bibliotecas como TransformerLens para añadir un paso de reparación en flujos de análisis de GPT-2.

## Benchmarks y rendimiento

El autor reporta resultados sobre 44 direcciones de validación, con la métrica de expresividad del rasgo y `dist_1` (fracción de tokens distintos respecto al texto sin intervenir). Los agregados se recalculan mediante los tests del repositorio de código.

| Metodo | Incremento | Error estandar | Mejor que crudo |
|---|---|---|---|
| Denoizador entrenado | +1,153 | 0,165 | 40 de 44 |
| Operador de Wiener | +0,705 | 0,102 | 40 de 44 |

Diferencia pareada a favor del denoizador: +0,448 ± 0,110, p = 0,00025. El autor indica que el signo se mantiene tras normalizar por escala de latente, en tres pares adicionales de métricas y en 20 direcciones estrictamente reservadas añadidas posteriormente.

## Requisitos de hardware

- El modelo es un denoizador de 11,7 millones de parámetros; la inferencia requiere una GPU con al menos 1 GB de VRAM (el tensor de entrada es de 768 dimensiones).
- Compatible con cualquier GPU consumer moderna (RTX 3060, 4090, etc.) y también con CPU, dado el tamaño del modelo.
- No requiere hardware especializado; la carga se hace con PyTorch y `huggingface_hub`.
- El despliegue se realiza mediante hooks manuales en el flujo de GPT-2; no se integra con vLLM, llama.cpp ni Ollama por ser un módulo de investigación.
- La latencia es mínima: el denoizador añade una operación matricial de bajo coste por cada posición de token.

## Comparativa con modelos similares

No hay modelos comparables directamente, porque el steering-denoiser no es un modelo de lenguaje sino un módulo de reparación de activaciones. Se puede comparar con el propio operador de Wiener que el autor proporciona en el mismo repositorio:

| Metodo | Parámetros | Entrenamiento | Mejora vs crudo |
|---|---|---|---|
| Denoizador entrenado | 11,7 M | 6000 pasos, 1M activaciones | +1,153 |
| Operador Wiener | no aplica (estadístico) | Ninguno | +0,705 |

Ambos operan sobre GPT-2 small, capa 6, con direcciones del mismo SAE. El denoizador supera al operador de Wiener en la métrica principal.

## Limitaciones y advertencias

- Validado solo sobre un modelo (GPT-2 small), una capa (la 6) y un conjunto de direcciones de un único SAE; no hay garantía de generalización a otros modelos o capas.
- Las direcciones del SAE pueden estar correlacionadas entre sí, lo que podría inflar la métrica de expresividad.
- La métrica principal de expresividad se basa en el mismo SAE del que se derivan las direcciones, por lo que hay un sesgo circular; la métrica de distancia de tokens no usa activaciones del SAE pero está vinculada al procedimiento de selección.
- No se ha realizado una evaluación humana de la coherencia del texto generado.
- La posición 0 del residual stream se excluye del protocolo de evaluación porque su norma es ~35 veces mayor que la mediana (87,75).
- El rango de fuerza de intervención probado es de 40 a 250; fuera de este rango no hay evidencia de que el modelo se comporte correctamente.
- La licencia MIT cubre solo los pesos del denoizador y el código del repositorio; los pesos de GPT-2, el SAE y Qwen (usado para evaluar cross-entropy) tienen sus propias licencias.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/NikitaLosev/steering-denoiser-gpt2
- Código, protocolo y reporte: https://github.com/NikitaLosev/steering-denoiser (archivo `report/REPORT.md`)
- Modelo base: https://huggingface.co/openai-community/gpt2
- SAE OpenAI: https://github.com/openai/sparse_autoencoder
