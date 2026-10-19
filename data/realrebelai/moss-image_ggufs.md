# realrebelai/MOSS-Image_GGUFs

## Resumen

MOSS-Image_GGUFs es una colección de cuantizaciones comunitarias del modelo de generación de imágenes MOSS-Image, publicada por el usuario realrebelai (Rebel AI) sobre Hugging Face. No se trata de un modelo nuevo ni de una publicación oficial de OpenMOSS: es un repositorio derivado que toma los pesos de OpenMOSS-Team/MOSS-Image-SFT y los reempaqueta en formatos GGUF y W4A8 para reducir los requisitos de memoria en inferencia local. El modelo original es un diffusion transformer (DiT) de 5.082.308.624 parámetros (aproximadamente 5B) entrenado para texto-a-imagen, con soporte de prompts en lenguaje natural, prompts estilo etiquetas y layouts JSON estructurados.

La relevancia de este repositorio es práctica: el DiT de 5B en precisión completa ocupa del orden de 10 GB solo en pesos, y la pipeline completa requiere además un codificador de texto Qwen3.5-9B y un VAE compatible con FLUX.2, que no están incluidos en los ficheros GGUF. Al ofrecer niveles cuantizados, el autor busca que la generación de imágenes con MOSS-Image sea viable en GPUs de consumo y en flujos de trabajo de ComfyUI, manteniendo una escala de compromiso calidad/tamaño.

Es importante señalar que estos pesos son de generación de imágenes, no modelos conversacionales: no funcionan en llama.cpp, LM Studio ni cargadores GGUF de LLM convencionales. Requieren una integración de inferencia que implemente el transformer de MOSS-Image y soporte el formato de cuantización elegido. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para texto-a-imagen; pipeline con codificador de texto Qwen3.5-9B y VAE compatible con FLUX.2 |
| Parametros totales | 5.082.308.624 (DiT; el codificador de texto y el VAE se distribuyen por separado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (F16 como referencia y niveles inferiores) y W4A8; la lista completa de niveles no esta disponible en la informacion proporcionada (model card truncada) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF y safetensors (variantes W4A8); el repo base declara safetensors |

## Arquitectura y entrenamiento

El componente cuantizado es un diffusion transformer de 5B parámetros que actúa como generador principal dentro de una pipeline de tres piezas: el DiT de MOSS-Image, un codificador de texto Qwen3.5-9B que aporta el condicionamiento textual y un VAE compatible con FLUX.2 que codifica y decodifica los latentes de imagen. Solo el DiT se incluye en los GGUF de este repositorio; el codificador de texto y el VAE deben obtenerse aparte. El modelo admite tres modos de prompt: lenguaje natural, estilo etiquetas y layouts JSON estructurados, lo que permite un control explícito de la colocación de texto y objetos en la composición.

En cuanto al entrenamiento, el checkpoint de referencia es MOSS-Image-SFT, un ajuste supervisado (SFT) sobre MOSS-Image-Base con datos curados. El repositorio distingue explícitamente ambos: SFT no es una cuantización distinta de Base, sino pesos con fine-tuning superpuesto, y los checkpoints etiquetados como Base incluidos en la pestaña de ficheros derivan de OpenMOSS-Team/MOSS-Image-Base y se ofrecen para investigación, fine-tuning y comparaciones A/B controladas. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO en la información proporcionada. El trabajo de este repositorio es exclusivamente de cuantización: no altera la arquitectura ni el entrenamiento original, que pertenecen al equipo de OpenMOSS.

## Capacidades

- Generación de imágenes texto-a-imagen en estilos fotorrealista, ilustrativo, tipográfico y otros, según la model card del autor.
- Acepta prompts en lenguaje natural, prompts estilo etiquetas y layouts JSON estructurados para control de posicionamiento de texto y objetos.
- Composición estructurada: el modo JSON permite especificar colocación deliberada de elementos en la escena.
- Generación de tipografía y texto dentro de la imagen, según los estilos soportados declarados.
- Multilingüe limitado a inglés y chino (en, zh).
- Distribución en formatos cuantizados GGUF y W4A8 orientados a inferencia local con poca VRAM e integración con ComfyUI.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de difusión, no un LLM.
- No soporta entrada de imagen ni audio: la pipeline declarada es únicamente texto-a-imagen.

## Casos de uso

- Generación de imágenes en local con GPU de consumo: usando los niveles GGUF o W4A8 del DiT junto al codificador Qwen3.5-9B cuantizado y el VAE, se puede montar una pipeline de texto-a-imagen en una estación de trabajo sin GPU de datacenter.
- Integración en ComfyUI: el repositorio está etiquetado explícitamente para ComfyUI, de modo que los nodos de carga de pesos pueden apuntar a los ficheros GGUF para flujos de trabajo nodales con control fino de cada etapa.
- Cartelería y diseño con texto renderizado: el soporte de layouts JSON y de estilos tipográficos permite especificar la posición de titulares y elementos gráficos, útil para prototipos de carteles, banners y portadas.
- Prototipado rápido de conceptos visuales: con prompts en lenguaje natural se pueden iterar bocetos de personajes, escenarios o productos antes de encargar arte final.
- Investigación en cuantización de modelos de difusión: la escala de niveles permite estudiar la degradación de calidad frente a tamaño de fichero y comparar SFT contra Base en condiciones controladas.
- Entrenamiento de LoRAs y fine-tuning sobre la variante Base: los checkpoints Base incluidos están pensados para investigación y ajuste posterior, sirviendo como punto de partida para estilos o dominios concretos.
- Evaluación comparativa interna de adherencia al prompt: al disponer de SFT y Base con la misma arquitectura, se pueden hacer pruebas A/B de fidelidad al texto sin cambiar de pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas cuantitativas (FID, CLIP score, adherencia al prompt ni evaluaciones humanas) para ninguno de los niveles de cuantización, y advierte explícitamente que listar un nivel en la tabla de cuantización no implica que se haya publicado ni evaluado individualmente.

## Requisitos de hardware

- VRAM del DiT en F16: en torno a 10 GB solo en pesos (estimación a partir de 5.082.308.624 parámetros a 2 bytes), más activaciones y latentes.
- VRAM del DiT en W4A8: aproximadamente 2,5-3 GB en pesos (estimación), lo que deja margen para el resto de la pipeline en tarjetas de 8-12 GB.
- La pipeline completa necesita además el codificador de texto Qwen3.5-9B (del orden de 18 GB en FP16, reducible a 5-9 GB con cuantización de 8 o 4 bits) y el VAE compatible con FLUX.2. El requisito real de VRAM es, por tanto, muy superior al del DiT aislado.
- GPU recomendadas: para F16, A100 40/80 GB o H100 si se ejecuta la pipeline completa sin cuantizar; para configuraciones cuantizadas, RTX 4090 (24 GB) o RTX 3090 con comodidad.
- Cabe en GPU de consumo: sí, en el rango RTX 3060 12 GB / RTX 4060 Ti 16 GB / RTX 4070 en adelante, siempre que el codificador de texto y el VAE también estén cuantizados o se descarguen por etapas.
- Opciones de despliegue: no es compatible con llama.cpp, LM Studio ni cargadores GGUF de LLM. Requiere una integración que implemente el transformer de MOSS-Image y lea GGUF; el caso de uso declarado es ComfyUI, además de scripts propios basados en el repositorio de OpenMOSS.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por imagen ni de imágenes por segundo para ninguno de los niveles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image (SFT), este repo cuantizado | 5,08B (DiT) + Qwen3.5-9B (texto) + VAE FLUX.2 | no disponible | Apache 2.0 | GGUF y W4A8 en HF; pesos originales en OpenMOSS |
| FLUX.1 [schnell] | 12B | codificador T5 + CLIP; contexto no disponible | Apache 2.0 | pesos abiertos en HF, amplio soporte en ComfyUI |
| FLUX.1 [dev] | 12B | codificador T5 + CLIP; contexto no disponible | no comercial | pesos abiertos con restriccion de uso comercial |
| Stable Diffusion 3.5 Large | 8B | codificadores CLIP + T5; contexto no disponible | Stability AI Community License | pesos abiertos en HF |

No existen comparaciones head-to-head publicadas entre MOSS-Image y estos modelos en la información disponible, por lo que la tabla se limita a parámetros, licencia y disponibilidad. El dato diferencial de MOSS-Image es su tamaño reducido (5B) frente a los 8-12B habituales, lo que abarata la inferencia, junto con el soporte nativo de layouts JSON.

## Limitaciones y advertencias

- Este repositorio es una cuantización no oficial: el modelo, la arquitectura y el entrenamiento pertenecen a OpenMOSS. Cualquier problema de calidad atribuible a la cuantización no debe reportarse contra el modelo original.
- Los GGUF contienen únicamente el DiT: sin el codificador Qwen3.5-9B y el VAE compatible con FLUX.2 no se puede generar ninguna imagen.
- No funcionan en llama.cpp, LM Studio ni cargadores GGUF de LLM. Intentar cargarlos en esas herramientas produce error o resultados sin sentido.
- La cuantización introduce degradación de calidad respecto a F16, especialmente en los niveles más agresivos (W4A8); el autor no publica métricas de esa pérdida.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar texto ilegible, anatomías incorrectas, objetos duplicados o elementos incoherentes con el prompt, especialmente en composiciones con muchos objetos o tipografía densa.
- Cobertura lingüística limitada a inglés y chino; el rendimiento con prompts en castellano no está documentado y previsiblemente será peor.
- Idiomas y sesgos: no se documentan sesgos demográficos ni de representación, ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de estereotipos.
- La model card está truncada en la tabla de niveles de cuantización: conviene revisar la pestaña de ficheros para confirmar qué checkpoints están realmente publicados antes de planificar un despliegue.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de pesos de OpenMOSS conviene verificar la licencia del repositorio base y del VAE (FLUX.2) por separado, ya que pueden tener términos distintos.
- No apto para producción sin evaluación propia: ausencia total de benchmarks, de métricas de latencia y de informes de estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/realrebelai/MOSS-Image_GGUFs
- Modelo base (SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base (Base, referencia secundaria): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Perfil del autor en GitHub: https://github.com/RealRebelAI
- Perfil del autor en Hugging Face: https://huggingface.co/realrebelai
- Canal de YouTube del autor: https://www.youtube.com/@RealRebelAI
- Perfil del autor en Civitai: https://civitai.com/user/RealRebelAI
- Perfil del autor en X: https://x.com/realrebelai

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre MOSS-Image ni sobre este repositorio; únicamente contenido no relacionado que se ha descartado.
