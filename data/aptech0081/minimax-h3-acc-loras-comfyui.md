# aptech0081/MiniMax-H3-Acc-LoRAs-ComfyUI

## Resumen

Este repositorio contiene una conversión a ComfyUI de los LoRAs de aceleración oficiales de Alibaba Cloud (alibaba-pai) para el modelo MiniMax-H3, un sistema de generación de vídeo y audio nativo multimodal de 2K con audio estéreo 3D sincronizado. La conversión permite cargar directamente los pesos en ComfyUI sin necesidad de transformaciones en memoria, manteniendo una equivalencia bit-idéntica con los archivos originales.

El paquete incluye dos LoRAs: uno para el trunk FL2VA y otro para Ref2VA, cada uno con un trunk LoRA de rango 64 y un banco de cabezas de destilación de decodificación paralela (PDD) con 32 proyecciones por intervalo y por modalidad (vídeo y audio). Estos LoRAs aceleran el muestreo del modelo base a 8 pasos (también 4) sin clasificador libre (CFG-free), lo que reduce drásticamente el coste de inferencia para la generación de vídeo con audio.

La relevancia actual radica en que ofrece una integración directa con el ecosistema ComfyUI, un estándar de facto para flujos de trabajo de generación de medios, y facilita la adopción de técnicas de destilación de decodificación paralela en entornos de producción. El repositorio se limita a una transformación de formato, manteniendo la licencia Apache-2.0 del trabajo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de aceleración PDD para MiniMax-H3 (modelo de difusión multimodal vídeo+audio) |
| Parametros totales | no disponible (repo de 3,3 GB con dos archivos safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base MiniMax-H3) |
| Tipos de cuantizacion | no disponible (se recomienda bf16 o int8-convrot para el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (dos archivos: `minimax_h3_fl2va_pdd_acc_8step_comfyui.safetensors` y `minimax_h3_ref2va_pdd_acc_8step_comfyui.safetensors`) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un generador nativo multimodal que produce vídeo y audio sincronizado a partir de texto. Los LoRAs aquí presentados implementan una técnica de destilación de decodificación paralela (PDD, por sus siglas en inglés) descrita en el artículo arXiv:2607.26004. La PDD entrena un banco de cabezas de proyección final que permite al modelo predecir múltiples pasos de muestreo simultáneamente, reduciendo el número de evaluaciones de función (NFE) de los típicos 20-30 a 8 o incluso 4, sin necesidad de CFG.

El entrenamiento de los LoRAs fue realizado por Alibaba-PAI y liberado bajo Apache-2.0. La conversión a formato ComfyUI reestructura los pesos de los módulos de atención (qkv, out_proj), de las capas feed-forward (SwiGLU) y de los bloques token_refiner, manteniendo exactamente el mismo comportamiento numérico. El banco de cabezas PDD (proj_out y audio_proj_out) se conserva sin cambios. La conversión se verificó bit-identidad con la transformación en memoria que realiza el nodo personalizado, y cada archivo safetensors incluye metadatos de procedencia.

## Capacidades

- Generación de vídeo y audio sincronizado a partir de texto (text-to-video con audio).
- Aceleración del muestreo mediante destilación de decodificación paralela: 8 pasos de muestreo (también 4) sin CFG.
- Compatibilidad con ComfyUI mediante el nodo personalizado `ComfyUI-MiniMax-H3-PDD-Acc`.
- Soporte de dos variantes del modelo base: FL2VA y Ref2VA.
- Integración con el flujo de trabajo estándar de ComfyUI: `UNETLoader → MiniMaxH3SigmaShift → MiniMax H3 PDD Acc LoRA → BasicGuider → SamplerCustomAdvanced`.
- Conversión bit-idéntica de los pesos, garantizando reproducibilidad exacta respecto a los archivos originales.

## Casos de uso

- **Generación de vídeo de alta calidad en producción**: al reducir el número de pasos de muestreo de decenas a 8, se puede integrar la generación de vídeo en servicios en tiempo real o en pipelines de procesamiento por lotes con latencia reducida. El LoRA se aplica directamente al UNET del modelo base, sin necesidad de entrenamiento adicional.
- **Edición de vídeo asistida por IA**: los LoRAs permiten refinar y acelerar la generación de secuencias intermedias en herramientas de edición, manteniendo la coherencia temporal y de audio.
- **Creación de contenido para redes sociales**: la generación de clips cortos con audio sincronizado en 8 pasos permite producir material para plataformas como YouTube Shorts, TikTok o Reels de forma eficiente.
- **Sincronización de audio y vídeo en doblaje**: la capacidad de generar audio 3D sincronizado con el vídeo facilita la creación de pistas de sonido envolvente para experiencias inmersivas, como vídeo 360 o realidad virtual.
- **Prototipado rápido en diseño y publicidad**: los equipos creativos pueden generar múltiples variantes de un vídeo publicitario en minutos, evaluando conceptos sin invertir horas de renderizado.
- **Investigación en destilación de modelos**: este repositorio sirve como referencia práctica para implementar y evaluar técnicas de destilación de decodificación paralela en modelos de difusión de vídeo, gracias a su código de conversión y su suite de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye comparativas numéricas de calidad o velocidad frente a otras soluciones. Los únicos datos relevantes son los pasos de muestreo (8 o 4) y la ausencia de CFG, pero no hay mediciones de FVD (Fréchet Video Distance), CLIP score ni throughput.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño de los LoRAs es de 3,3 GB en total, pero el modelo base MiniMax-H3 (FL2VA o Ref2VA) requiere una cantidad de memoria significativa. Es recomendable al menos 16 GB de VRAM para una resolución moderada, aunque no se especifica en la documentación.
- **GPU recomendadas**: no se proporciona una lista concreta. Para modelos de difusión de video de 2K, se espera que GPU de gama alta (A100, H100, RTX 4090) sean adecuadas, pero sin confirmación.
- **Compatibilidad con GPU de consumo**: no se indica. Dado el tamaño del modelo base, es probable que se necesite cuantización o técnicas de offloading, pero no hay datos.
- **Opciones de despliegue**: ComfyUI es el entorno principal; también se puede cargar los archivos con el nodo personalizado `ComfyUI-MiniMax-H3-PDD-Acc`. No hay soporte directo para vLLM, Ollama o TGI en esta conversión.
- **Latencia y throughput**: no se proporcionan mediciones. La ventaja de PDD es la reducción de NFE, pero el coste real depende de la GPU y de la resolución.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **MiniMax-H3-Acc-LoRAs (este repo)** | LoRA PDD para MiniMax-H3 | 8 (o 4) | Sin CFG | Apache-2.0 | Hugging Face |
| **Comfy-Org/MiniMax-H3 turbo 8step** | LoRA turbo (destilación estándar) | 8 | Sin CFG | Apache-2.0 | Hugging Face |
| **MiniMax-H3 base (sin aceleración)** | Modelo de difusión | 20-30 | Con CFG | Apache-2.0 | Hugging Face |

La comparativa se basa en la información de los repositorios de Comfy-Org y de MiniMax-H3. No se dispone de datos de rendimiento o calidad que permitan una comparación cuantitativa. La ventaja principal del PDD es que el banco de cabezas permite una aceleración más agresiva con menos degradación de calidad, según la descripción del paper, pero no se aportan métricas.

## Limitaciones y advertencias

- **Dependencia de nodo personalizado**: los archivos no funcionan sin el nodo `ComfyUI-MiniMax-H3-PDD-Acc`; no son LoRAs convencionales que se carguen con el nodo LoRA estándar de ComfyUI.
- **No son LoRAs convencionales**: cada archivo incluye un trunk LoRA y un banco de cabezas PDD; si se aplica con un cargador LoRA genérico, el comportamiento no será el esperado.
- **No intercambiables**: el LoRA FL2VA no es compatible con el modelo Ref2VA y viceversa. Usar el LoRA equivocado puede producir errores o resultados corruptos.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero hay que mantener los avisos de copyright y la atribución. El modelo base MiniMax-H3 también es Apache-2.0.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir contenido visual o auditivo no solicitado o incoherente, especialmente con prompts ambiguos.
- **Sin información sobre sesgos**: no se han documentado sesgos específicos para este modelo. Es probable que herede los sesgos del modelo base y de los datos de entrenamiento, no disponibles.
- **Fecha de creación**: el repositorio se creó en agosto de 2026, por lo que la técnica PDD es muy reciente y podría no estar ampliamente validada en producción.

## Enlaces

- [Hugging Face - aptech0081/MiniMax-H3-Acc-LoRAs-ComfyUI](https://huggingface.co/aptech0081/MiniMax-H3-Acc-LoRAs-ComfyUI)
- [Hugging Face - alibaba-pai/MiniMax-H3-Acc-LoRAs (original)](https://huggingface.co/alibaba-pai/MiniMax-H3-Acc-LoRAs)
- [Hugging Face - MiniMaxAI/MiniMax-H3 (modelo base)](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [GitHub - Jalen-Brunson/ComfyUI-MiniMax-H3-PDD-Acc (nodo personalizado)](https://github.com/Jalen-Brunson/ComfyUI-MiniMax-H3-PDD-Acc)
- [Paper PDD - arXiv:2607.26004](https://arxiv.org/abs/2607.26004)
- [Colección MiniMax-H3 en Hugging Face](https://huggingface.co/collections/MiniMaxAI/minimax-h3)
- [GitHub - ai-models-lab/minimax-h3 (hub comunitario)](https://github.com/ai-models-lab/minimax-h3)
- [Guía de LoRAs MiniMax H3 - minimax3.org](https://minimax3.org/minimax-h3-lora)
- [Tutoriales oficiales - design.minimax.io/h3](https://design.minimax.io/h3)
