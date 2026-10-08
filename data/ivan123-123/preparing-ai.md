# ivan123-123/preparing.ai

## Resumen

preparing.ai, publicado también como DesignForge Qwen2.5-VL 3B, es un ajuste fino del modelo multimodal Qwen/Qwen2.5-VL-3B-Instruct desarrollado por el usuario de HuggingFace ivan123-123. Su tarea es concreta: recibe una captura de pantalla de una página web junto con un brief de diseño breve en texto y devuelve un único documento HTML autocontenido, con CSS y JavaScript, sin bloques de markdown ni recursos externos. Cubre así el paso de diseño a código (image-to-code) en un modelo de 3,75 mil millones de parámetros.

Técnicamente es un adaptador LoRA con rango 16 fusionado sobre el modelo base y distribuido en safetensors, con un repositorio de 7,5 GB. El entrenamiento consistió en 200 pasos de optimizador con acumulación de gradiente 4, tasa de aprendizaje 2e-4 con scheduler coseno, precisión bf16 y cuantización NF4 de 4 bits, ejecutado sobre una GPU P100. El conjunto de datos son 504 pares de captura y brief escritos a mano, estilo WebSight, repartidos en 500 ejemplos de entrenamiento y 4 de validación.

Su relevancia es la de un experimento acotado: pocos datos, cero descargas y cero valoraciones en el momento de redactar esta ficha, y ninguna métrica estándar publicada. Aun así, ilustra una práctica habitual y útil, la de especializar modelos visión-lenguaje pequeños en una tarea de generación de interfaz concreta con un coste de cómputo muy bajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje de la familia Qwen2.5-VL: codificador visual tipo ViT con atención en ventanas y resolución dinámica nativa, más decodificador de lenguaje con codificación posicional MRoPE |
| Parámetros totales | 3.754.622.976 (≈3,75 mil millones), dato real de los safetensors |
| Parámetros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Qwen2.5-VL-3B-Instruct declara 32.768 tokens |
| Tipos de cuantización | bf16 y NF4 de 4 bits con bitsandbytes (usadas en entrenamiento y en la prueba de artefacto); GGUF, AWQ y GPTQ no confirmados |
| Idiomas soportados | no disponible; el prompt de sistema incluido por el autor está redactado en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo fusionado en fp16); el adaptador LoRA se publica en un repositorio aparte |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del base Qwen2.5-VL-3B-Instruct: un codificador visual que procesa la imagen a resolución dinámica nativa y la proyecta al espacio de tokens del decodificador de lenguaje, que es un transformer autoregresivo denso. El ajuste es un LoRA de rango 16 aplicado sobre ese modelo y posteriormente fusionado, por lo que en inferencia no hay adaptadores separados ni sobrecoste de latencia respecto al modelo base. El procesador conserva el presupuesto de píxeles del entrenamiento, con min_pixels=100352 y max_pixels=301056, equivalentes a unos 1008x784 píxeles; mantener esos valores es necesario para que el encuadre de las imágenes coincida con el visto durante el ajuste.

El entrenamiento se realizó durante 200 pasos de optimizador con acumulación de gradiente 4 y scheduler coseno, sobre 504 pares de captura y brief escritos a mano y con formato tipo WebSight, de los que 500 se destinaron a entrenamiento y 4 a validación. No se documenta ni RLHF ni DPO, ni fases de ajuste posteriores al SFT. El autor recomienda muestreo en lugar de decodificación voraz, ya que en fp16 el greedy puede degenerar en repeticiones de caracteres. La evaluación publicada es mínima: sobre el conjunto de validación de 4 ejemplos, 3 de 3 resultados válidos estructuralmente y renderizables, con una SSIM media de 0,67 frente a la captura de referencia, además de una prueba de artefacto con 4 bits más LoRA y muestreo que pasa.

## Capacidades

- Generación de documentos HTML completos y autocontenidos a partir de una captura de pantalla más un brief de diseño en lenguaje natural, con CSS y JavaScript embebidos y sin bloques de código markdown.
- Comprensión de imágenes de interfaz de usuario: interpreta disposición, jerarquía visual, colores, tipografía y componentes a partir de la captura.
- Seguimiento de instrucciones de diseño expresadas en el brief, con un prompt de sistema específico que define el rol de ingeniero front-end y diseñador de UI.
- Salida de longitud media: entre 1.700 y 2.600 tokens por documento, con un límite práctico de 2.500 tokens nuevos en el ejemplo de uso publicado.
- Soporte del chat template del procesador de Qwen2.5-VL, con mensajes multimodales de tipo imagen y texto.
- Capacidades multilingües: no disponibles; el prompt de sistema y el conjunto de entrenamiento están en inglés.
- Tool calling, function calling y razonamiento agéntico multiturno: no documentados en el ajuste, aunque el modelo base Qwen2.5-VL sí contempla function calling.
- Modo de razonamiento explícito, visión más allá de capturas de interfaz, audio o vídeo: no disponibles.

## Casos de uso

- Prototipado rápido de interfaces: a partir de una captura de una web de referencia y un brief de dos o tres líneas, el modelo produce un HTML autocontenido que puede abrirse directamente en el navegador, lo que reduce el tiempo de la primera maqueta funcional.
- Migración o rediseño de páginas existentes: se le pasa la captura de una página antigua y un brief con el nuevo estilo objetivo, y devuelve una versión reescrita con HTML y CSS modernos, útil como punto de partida para una refactorización manual posterior.
- Validación temprana con clientes: en una agencia, el equipo de diseño puede generar variantes de una landing a partir de bocetos y capturas para enseñar opciones navegables antes de invertir horas de desarrollo.
- Generación de plantillas base para CMS: el HTML de salida, al ser autocontenido y sin dependencias externas, se puede trocear con facilidad en plantillas parciales para WordPress, Drupal u otros gestores.
- Asistencia dentro de herramientas internas de diseño: integrado en un panel propio mediante transformers, el modelo actúa como generador de maquetas a partir de capturas subidas por el equipo, con el prompt de sistema fijo que documenta el autor.
- Docencia y formación en front-end: sirve para ilustrar cómo se traduce una composición visual a estructura HTML y CSS, comparando la captura de entrada con el resultado renderizado.
- Generación de correos HTML y páginas de campaña simples: con salidas de 1.700 a 2.600 tokens, el tamaño encaja bien en documentos de una sola pantalla con estilos en línea.
- Pruebas de concepto de pipelines image-to-code: al ser un modelo de 3,75 mil millones de parámetros y con licencia no declarada, es adecuado para experimentación interna antes de decidir si se escala a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, Design2Code u otros) en la información disponible. Los únicos datos de evaluación son los de la propia model card:

| Evaluación | Conjunto | Resultado |
|---|---|---|
| HTML estructuralmente válido y renderizable | 4 ejemplos de validación | 3 de 3 |
| Similitud estructural con la captura de referencia (SSIM) | 4 ejemplos de validación | 0,67 de media |
| Prueba de artefacto (4 bits + LoRA, con muestreo) | no especificado | PASS |

## Requisitos de hardware

- Pesos en fp16 o bf16: unos 7,5 GB, que con activaciones del codificador visual y caché KV sitúan el consumo práctico en torno a 10-12 GB de VRAM para contextos cortos.
- Cuantización NF4 de 4 bits: aproximadamente 2,5-3 GB de pesos, con un consumo total estimado de 5-6 GB de VRAM.
- Cabe en GPU de consumo: sí. En 4 bits funciona en tarjetas de 8 GB como la RTX 3060 Ti o la RTX 4060; en bf16 conviene una RTX 3090, RTX 4080 o RTX 4090 con 16-24 GB.
- GPU de centro de datos: A100 de 40 o 80 GB, H100 o L40S para servir con lotes grandes. El autor entrenó sobre una P100 de 16 GB en 4 bits.
- Opciones de despliegue: transformers, que es la vía documentada en la model card con Qwen2_5_VLForConditionalGeneration y AutoProcessor. El repositorio incluye las etiquetas text-generation-inference y endpoints_compatible, lo que sugiere compatibilidad con TGI y con Inference Endpoints. El soporte en vLLM, llama.cpp y Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. La única referencia de coste es la longitud de salida esperada, de 1.700 a 2.600 tokens por documento.

## Comparativa con modelos similares

No hay datos de rendimiento comparables publicados para este ajuste, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| preparing.ai (DesignForge) | 3,75 mil millones | no disponible (base: 32.768 tokens) | no disponible | HuggingFace, 0 descargas, 0 valoraciones |
| Qwen2.5-VL-3B-Instruct | 3,75 mil millones | 32.768 tokens | Apache 2.0 según el modelo base | Ampliamente disponible y con ecosistema de herramientas |
| Qwen2.5-VL-7B-Instruct | 7,6 mil millones | 32.768 tokens | Apache 2.0 según el modelo base | Ampliamente disponible |
| Qwen2.5-Coder-7B-Instruct | 7,6 mil millones | 32.768 tokens | Apache 2.0 según el modelo base | Ampliamente disponible; solo texto, sin entrada de imagen |

El modelo comparado más directo es su propio base, Qwen2.5-VL-3B-Instruct: preparing.ai añade la especialización en generación de HTML a partir de capturas, pero pierde la generalidad y no aporta métricas que permitan cuantificar la mejora. Frente a Qwen2.5-VL-7B-Instruct, el modelo aquí descrito tiene la mitad de parámetros y la ventaja de un formato de salida muy acotado, aunque también muchas menos horas de ajuste. Frente a los modelos solo de código, la diferencia clave es la entrada multimodal.

## Limitaciones y advertencias

- Licencia no declarada: es el riesgo principal para uso comercial. El campo de licencia aparece como no disponible, y aunque el modelo base Qwen2.5-VL-3B-Instruct se distribuye bajo Apache 2.0, la ausencia de licencia explícita en este repositorio impide asumir los mismos términos sin consultar al autor.
- Conjunto de entrenamiento muy pequeño: 504 pares de captura y brief, con solo 4 ejemplos de validación. Los 3 de 3 aciertos estructurales no son estadísticamente significativos.
- SSIM media de 0,67: refleja una similitud estructural moderada con la captura de referencia, no una reproducción fiel píxel a píxel. No debe esperarse una réplica exacta del diseño de entrada.
- Degeneración en decodificación voraz: el propio autor advierte que el greedy en fp16 puede producir repeticiones de caracteres, por lo que es obligatorio usar muestreo con temperatura 0,6, top_p 0,9 y top_k 50.
- Restricción de píxeles: hay que respetar el presupuesto min_pixels=100352 y max_pixels=301056. Enviar imágenes con otras proporciones degrada el resultado porque el encuadre deja de coincidir con el del entrenamiento.
- Límite de longitud de salida: 2.500 tokens nuevos en el ejemplo publicado. Páginas largas o con muchos componentes probablemente se trunquen o queden incompletas.
- Idiomas: no hay información sobre capacidades multilingües y todo el material de entrenamiento y el prompt de sistema están en inglés. Se desconoce el comportamiento con briefs en castellano.
- Riesgo de alucinación visual: al ser un modelo generativo sobre imágenes, puede inventar componentes, textos o jerarquías que no aparecen en la captura, especialmente en capturas densas o de baja resolución.
- Ausencia de benchmarks estándar y de datos de sesgo: no hay evaluación de MMLU, HumanEval, Design2Code ni análisis de sesgos, lo que dificulta estimar el comportamiento en producción.
- Adopción nula verificable: 0 descargas y 0 valoraciones en el momento de redactar esta ficha, sin comunidad que haya reportado casos de uso reales.
- Especificaciones del modelo base asumidas: los datos de contexto y arquitectura proceden de Qwen2.5-VL-3B-Instruct y no están confirmados en la model card del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ivan123-123/preparing.ai
- Adaptador LoRA: https://huggingface.co/ivan123-123/preparing.ai-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos corresponden a foros de televisión sin relación con el proyecto. No se dispone de paper, blog técnico, repositorio de código ni demo adicionales.
