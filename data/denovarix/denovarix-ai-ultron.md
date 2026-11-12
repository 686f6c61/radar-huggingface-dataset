# Denovarix/Denovarix-AI-Ultron

## Resumen

Denovarix AI Ultron es el modelo de mayor tamaño de la familia Denovarix AI, desarrollado por Denovarix Technologies LLP (West Bengal, India) para su sistema operativo DNX OS. Está diseñado específicamente para ejecutarse en el servidor de alto rendimiento DNX, una máquina con hasta 120 GB de memoria gráfica que da servicio a toda una oficina desde un único equipo, en lugar de ejecutarse en el PC de cada usuario como los modelos menores de la familia. Acepta entrada de texto e imágenes y está orientado a cargas de trabajo pesadas: análisis empresarial en DNX BI, contratos y licitaciones largas, documentos de compras y finanzas en lote, y agentes que ejecutan flujos de varios pasos antes de la validación humana.

El modelo se presenta bajo la etiqueta de generación de texto, con capacidades declaradas de image-text-to-text, tool calling y comprensión de documentos. Soporta inglés, hindi y bengalí. La propuesta de valor central es la privacidad: se ejecuta en hardware propiedad de la empresa y los datos no salen del edificio.

Es importante señalar que, en el momento de redactar esta ficha, el modelo está en desarrollo y los pesos no están publicados en Hugging Face. La model card indica explícitamente que la página describe un modelo en construcción y que el tamaño está "por anunciar". Por tanto, no hay arquitectura, parámetros, contexto ni benchmarks disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (tamaño "por anunciar") |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés (en), hindi (hi), bengalí (bn) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos no publicados) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, híbrida u otra), el número de parámetros, la composición del dataset de entrenamiento ni si se emplearon técnicas de alineación como RLHF o DPO. La model card únicamente indica que es un modelo propio entrenado por Denovarix para DNX OS y que forma parte de la familia Denovarix AI.

El único dato técnico concreto es el objetivo de despliegue: el servidor DNX de alto rendimiento con hasta 120 GB de memoria gráfica, lo que sugiere un modelo de gran tamaño pensado para inferencia en servidor y no para hardware de consumo. No se detalla si incorpora innovaciones como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto en inglés, hindi y bengalí.
- Comprensión de imágenes (image-text-to-text), según las etiquetas del modelo.
- Comprensión de documentos, orientada a contratos, licitaciones y documentación financiera.
- Tool calling / function calling, según las etiquetas del modelo.
- Soporte para agentes que ejecutan flujos de varios pasos con validación humana antes de la firma.
- Integración prevista con DNX BI para análisis a escala de toda la empresa.
- Despliegue en servidor compartido que da servicio a PCs, teléfonos y automatizaciones de la organización.

## Casos de uso

- Análisis empresarial centralizado: el modelo se ejecuta en el servidor DNX y atiende consultas de DNX BI para toda la oficina, de modo que los datos analíticos no salen de la infraestructura de la empresa.
- Revisión de contratos y licitaciones: procesamiento de documentos largos de compras y finanzas en lote desde una única máquina, adecuado para departamentos legales o de procurement que manejan volumen alto.
- Agentes multi-paso con aprobación humana: automatizaciones que encadenan varias acciones (consulta de documentos, extracción de datos, generación de borradores) y requieren la firma de una persona antes de completarse.
- Asistencia interna compartida: PCs y teléfonos de la plantilla envían tareas pesadas al servidor central, lo que permite ofrecer capacidades de IA a equipos con hardware modesto.
- Procesamiento de documentos con imágenes: al aceptar entrada de texto e imagen, puede extraer información de documentos escaneados, facturas o formularios.
- Despliegue en entornos con requisitos de soberanía del dato: organizaciones que necesitan IA generativa sin enviar información a servicios en la nube de terceros.
- Atención multilingüe para mercados del sur de Asia: cobertura de inglés, hindi y bengalí para organizaciones con operaciones en India.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Objetivo de despliegue: servidor DNX de alto rendimiento con hasta 120 GB de memoria gráfica.
- VRAM estimada para inferencia: no disponible (depende de un tamaño de parámetros no anunciado).
- GPU recomendadas: no disponible; el fabricante especifica su propio servidor DNX, no modelos de GPU concretos.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el diseño apunta a un servidor compartido, no a estaciones de trabajo individuales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado parámetros, contexto ni rendimiento del modelo, y la información proporcionada no identifica alternativas comparables de la misma categoría.

## Limitaciones y advertencias

- El modelo está en desarrollo: los pesos no están publicados y no puede evaluarse ni desplegarse actualmente.
- No se ha publicado la licencia, por lo que se desconoce si el uso comercial está permitido y bajo qué condiciones.
- No hay información sobre sesgos, riesgo de alucinación ni calidad por idioma más allá de la lista de idiomas soportados.
- La longitud de contexto es desconocida, lo que impide valorar su idoneidad real para documentos largos pese a la orientación declarada.
- El acceso parece gestionarse mediante contacto directo con el fabricante (evaluación, licencia o piloto), no mediante descarga abierta.
- La cobertura lingüística se limita a inglés, hindi y bengalí; no se declara soporte de castellano.
- Al tratarse de un modelo vinculado a un hardware propietario (servidor DNX), la portabilidad a otras plataformas no está garantizada ni documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Denovarix/Denovarix-AI-Ultron
- Sitio web del fabricante: https://denovarix.com
- DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
