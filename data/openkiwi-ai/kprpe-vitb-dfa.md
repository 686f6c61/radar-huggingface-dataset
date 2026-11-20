# openkiwi-ai/kprpe-vitb-dfa

## Resumen

KP-RPE ViT-B con su alineador de puntos clave es un modelo de reconocimiento facial empaquetado en un único fichero ONNX por el proyecto OpenKiwi. El modelo subyacente, KP-RPE ViT-B, fue desarrollado por Minchul Kim y entrenado sobre WebFace12M; OpenKiwi se limita a convertirlo a ONNX e integrarlo en su aplicación de escritorio de código abierto. La arquitectura es un Vision Transformer de base (ViT-B) con un mecanismo de codificación posicional relativa basada en puntos clave (KeyPoint Relative Position Encoding), presentado en CVPR 2024. El modelo produce plantillas faciales de 512 dimensiones a partir de recortes alineados de 112x112 píxeles.

El paquete incluye dos redes: el extractor de características faciales KP-RPE ViT-B y un alineador de puntos clave basado en DFA MobileNet, que detecta cinco puntos faciales para alinear la cara antes de la extracción. El fichero ONNX resultante ocupa aproximadamente 463 MB (0,5 GB de repositorio) y reproduce las plantillas del modelo original en PyTorch con una similitud coseno mínima de 0,9999999998 sobre 1.000 caras públicas, según la model card.

Su relevancia es acotada: no es un modelo de propósito general ni un LLM, sino un componente especializado de reconocimiento facial para uso local y no comercial. La licencia es restrictiva (solo investigación y uso personal no comercial, derivada de la licencia del dataset de entrenamiento WebFace12M), y el autor no publica benchmarks estándar de verificación facial, solo una prueba casera con dos residentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer base (ViT-B) con KeyPoint Relative Position Encoding (KP-RPE) + alineador DFA MobileNet |
| Parametros totales | no disponible (el fichero ONNX pesa 463.026.892 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 1x3x112x112) |
| Tipos de cuantizacion | no disponible (solo se distribuye el ONNX en precisión original) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | research-only-training-data (uso personal no comercial; código CVLFace bajo MIT) |
| Formato de pesos | ONNX (`kprpe-vitb-dfa.onnx`) |
| Entrada | tensor `data` 1x3x112x112, RGB, normalizado `(pixel - 127.5) / 127.5`, cara prealineada con cinco puntos |
| Salidas | salida 0: plantilla facial de 512 números; salida 1: cinco puntos clave detectados por el alineador |
| Dataset de entrenamiento | WebFace12M (modelo facial); dataset del alineador no especificado |
| SHA-256 | `d4770875c2218e5167da27f0eb7fa7e99ae3021d9df093972953b4d7c2bd1627` |

## Arquitectura y entrenamiento

El componente principal es KP-RPE ViT-B, un Vision Transformer de tamaño base que incorpora KeyPoint Relative Position Encoding, una técnica que codifica la posición relativa de los parches de la imagen respecto a puntos clave faciales. Esta codificación se publicó en el artículo "KeyPoint Relative Position Encoding for Face Recognition" (CVPR 2024) y está pensada para mejorar la robustez del reconocimiento facial frente a variaciones de pose y expresión. El modelo fue entrenado sobre WebFace12M, un dataset de investigación compuesto por fotos web. El alineador es DFA MobileNet, una red ligera que localiza cinco puntos clave para alinear la cara antes de pasarla al extractor.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de visión). La model card indica que OpenKiwi solo realizó la conversión a ONNX mediante su herramienta `tools/export_kprpe.py`, sin modificar los pesos de Minchul Kim. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características faciales: genera una plantilla (embedding) de 512 dimensiones por cara, apta para comparación por similitud coseno.
- Detección y alineación de cinco puntos clave faciales mediante el alineador DFA MobileNet integrado.
- Reconocimiento e identificación de caras: comparando plantillas se puede asignar identidad a un rostro (la model card reporta un 63% de acierto nombrando caras con 3 fotos aprendidas en una prueba doméstica).
- Ejecución local: el modelo corre enteramente en el ordenador del usuario, sin envío de datos a servidores.
- Inferencia sobre CPU: aproximadamente 76 ms por cara en un procesador de escritorio, según la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni otras modalidades.

## Casos de uso

- Reconocimiento facial local en aplicaciones de escritorio: integrar el ONNX en una app tipo OpenKiwi para identificar personas conocidas a partir de unas pocas fotos de referencia, manteniendo las imágenes en el dispositivo.
- Control de acceso doméstico o de pequeña oficina: usar las plantillas de 512 dimensiones para verificar si una cara coincide con un residente registrado, con un coste de inferencia bajo en CPU.
- Organización de fototecas personales: agrupar imágenes por persona comparando embeddings faciales y etiquetar automáticamente carpetas.
- Verificación de identidad en flujos offline: comprobar que dos recortes faciales corresponden a la misma persona sin depender de servicios en la nube.
- Prototipos de investigación en reconocimiento facial: emplear el modelo como extractor de características preentrenado sobre WebFace12M para experimentos académicos con KP-RPE.
- Filtrado previo en pipelines de visión: usar el alineador DFA MobileNet para detectar y normalizar caras antes de pasarlas a otro modelo de análisis facial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una prueba interna: en un hogar con dos residentes, durante un día, con la misma tasa de desconocidos, el modelo nombró correctamente el 63% de las caras a partir de 3 fotos aprendidas (re-ejecución del 18 de noviembre), frente al 44% de AdaFace IR-101, con menos nombres erróneos. El propio autor advierte que es una prueba pequeña, de menos de una semana y sin desconocidos reales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero ONNX ocupa unos 463 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior); no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, dado el tamaño del fichero y la entrada de 112x112.
- Despliegue: ONNX Runtime; la model card no menciona vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: aproximadamente 76 ms por cara en CPU de escritorio, según la model card. No se publica throughput en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Plantilla | Licencia | Notas |
|---|---|---|---|---|---|
| KP-RPE ViT-B (este) | ViT-B + KP-RPE + DFA MobileNet | 112x112 | 512 dims | Solo investigación / no comercial | 63% de acierto en prueba doméstica con 3 fotos |
| AdaFace IR-101 | CNN IR-101 | no disponible | no disponible | no disponible | 44% de acierto en la misma prueba doméstica |
| cvlface_adaface_vit_base_kprpe_webface12m | ViT-B + KP-RPE | no disponible | no disponible | no disponible | Modelo PyTorch original de Minchul Kim del que deriva este ONNX |

No se dispone de datos de benchmarks estándar (por ejemplo, LFW, IJB-C) para comparar de forma rigurosa con alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: uso personal y no comercial únicamente; los pesos originales no declaran licencia propia y remiten a la del dataset WebFace12M, de investigación.
- Sesgos potenciales: entrenado sobre fotos web (WebFace12M), lo que puede introducir sesgos demográficos y de calidad de imagen no documentados.
- Riesgo de error de identificación: la única evaluación publicada es una prueba casera con dos residentes y sin desconocidos reales; no hay garantías de robustez en producción.
- Sin benchmarks estándar: no se han publicado resultados en LFW, IJB-C ni otros conjuntos de referencia.
- Dependencia del alineamiento: la entrada debe ser una cara ya alineada con cinco puntos y normalizada según la fórmula indicada; un alineamiento deficiente degrada la plantilla.
- Privacidad y regulación: el reconocimiento facial está sujeto a normativas estrictas (RGPD, AI Act); su uso en personas reales requiere base legal y consentimiento.
- Sin soporte de texto ni otras modalidades: no es un modelo de lenguaje ni multimodal general.
- Conversión no validada más allá de la similitud coseno: la equivalencia con PyTorch se comprobó solo sobre 1.000 caras públicas.

## Enlaces

- Hugging Face: https://huggingface.co/openkiwi-ai/kprpe-vitb-dfa
- Repositorio OpenKiwi: https://github.com/openkiwi-ai/openkiwi
- Modelo facial original: https://huggingface.co/minchul/cvlface_adaface_vit_base_kprpe_webface12m
- Alineador original: https://huggingface.co/minchul/cvlface_DFA_mobilenet
- Paper (arXiv): https://arxiv.org/abs/2403.14852
