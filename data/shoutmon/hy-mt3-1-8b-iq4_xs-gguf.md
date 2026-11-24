# shoutmon/Hy-MT3-1.8B-IQ4_XS-GGUF

## Resumen

Hy-MT3-1.8B-IQ4_XS-GGUF es una cuantización en formato GGUF del modelo de traducción automática tencent/Hy-MT3-1.8B, desarrollado originalmente por Tencent y convertido por el usuario shoutmon mediante la herramienta GGUF-my-repo de ggml.ai. El modelo base cuenta con 1.791.080.448 parámetros (aproximadamente 1,8 mil millones) y está especializado en traducción multilingüe, cubriendo más de 90 idiomas según las etiquetas de la model card.

La relevancia de esta ficha radica en que la cuantización IQ4_XS con imatrix reduce el peso del repositorio a aproximadamente 1 GB, lo que permite ejecutar un modelo de traducción de alta cobertura lingüística en hardware de consumo mediante llama.cpp. El modelo base está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial.

Se trata, por tanto, de una pieza de infraestructura para pipelines de traducción local, sin dependencia de APIs externas, adecuada para despliegues en CPU o GPU modestas donde el coste por token y la privacidad de los datos son críticos. No obstante, la información publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada en la model card de esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción; la model card de la cuantización no detalla la arquitectura interna) |
| Parametros totales | 1.791.080.448 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 2048`, pero no se confirma como contexto máximo) |
| Tipos de cuantizacion | IQ4_XS con imatrix (esta ficha); el repositorio base admite otras cuantizaciones GGUF vía llama.cpp |
| Idiomas soportados | más de 90 idiomas, entre ellos zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, entre otros |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `hy-mt3-1.8b-iq4_xs-imat.gguf`) |

## Arquitectura y entrenamiento

La model card de esta cuantización no proporciona detalles sobre la arquitectura interna del modelo base tencent/Hy-MT3-1.8B, más allá de que se trata de un modelo de traducción automática y que es compatible con la librería transformers. No se especifica si emplea un transformer denso, una variante MoE, SSM o una arquitectura híbrida, ni se detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO.

La única innovación técnica documentada en esta ficha es el proceso de cuantización: la conversión a GGUF se realizó mediante GGUF-my-repo de ggml.ai, y el sufijo `imat` indica el uso de una matriz de importancia (imatrix) para guiar la cuantización IQ4_XS, lo que habitualmente preserva mejor la calidad en comparación con cuantizaciones sin imatrix del mismo tamaño. Para obtener información sobre la arquitectura y el entrenamiento del modelo original, es necesario consultar la model card de tencent/Hy-MT3-1.8B.

## Capacidades

- Traducción automática multilingüe entre más de 90 idiomas, incluyendo pares de alta y baja recursos (chino, inglés, español, francés, alemán, árabe, hindi, tailandés, camboyano, birmano, entre otros).
- Generación de texto orientada a la tarea de traducción, no a propósito general.
- Compatibilidad con llama.cpp tanto en modo CLI como en modo servidor (`llama-server`), lo que permite exponer una API HTTP local.
- Ejecución en CPU y GPU mediante llama.cpp, sin necesidad de infraestructura de servidores dedicados.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Traducción de documentación técnica en local: el modelo puede traducir manuales y guías entre los idiomas soportados ejecutándose en una máquina de desarrollo, sin enviar contenido propietario a servicios externos.
- Localización de aplicaciones y sitios web: integrado en un pipeline de CI/CD mediante `llama-server`, permite traducir cadenas de recursos de forma automatizada antes de cada despliegue.
- Atención al cliente multilingüe: puede actuar como capa de traducción en un sistema de tickets, traduciendo mensajes entrantes y salientes entre el idioma del usuario y el del agente.
- Procesamiento de documentos en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para traducción de contratos o informes médicos que no pueden salir de la organización.
- Traducción de subtítulos y transcripciones: su tamaño reducido (aproximadamente 1 GB en IQ4_XS) permite procesar lotes de texto en hardware modesto con latencia aceptable.
- Investigación en traducción automática de bajos recursos: sirve como modelo de referencia ligero para experimentos con idiomas como camboyano, birmano, tibetano o cebuano, presentes en la lista de idiomas soportados.
- Despliegue en dispositivos de borde: al caber en memoria de equipos sin GPU dedicada, puede integrarse en aplicaciones de escritorio o entornos embebidos que requieran traducción offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo IQ4_XS ocupa aproximadamente 1 GB, por lo que la inferencia requiere del orden de 1,5 a 2 GB de memoria total (pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre, como GTX 1650, RTX 3050, RTX 4060 o superiores; también funciona en GPU de datacenter (A100, H100) aunque está sobredimensionada para ellas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio; no se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, del tamaño de contexto y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-IQ4_XS-GGUF (esta ficha) | 1,8 B | no disponible | Apache 2.0 | GGUF | Cuantización IQ4_XS con imatrix, ~1 GB |
| tencent/Hy-MT3-1.8B (base) | 1,8 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de traducción de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de traducción del mismo tamaño.

## Limitaciones y advertencias

- La model card de esta cuantización es una plantilla generada automáticamente por GGUF-my-repo; no incluye evaluación de calidad de la cuantización IQ4_XS frente al modelo original.
- La cuantización a 4 bits puede introducir degradación en la calidad de traducción, especialmente en idiomas de bajos recursos o en textos con terminología especializada; se recomienda validar con un conjunto de evaluación propio.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos: puede producir traducciones plausibles pero incorrectas en segmentos ambiguos o fuera de dominio.
- El contexto máximo no está confirmado; los ejemplos de la model card usan 2048 tokens, por lo que no debe asumirse una ventana mayor sin verificación.
- Aunque la licencia del modelo base es Apache 2.0, conviene revisar los términos del modelo original tencent/Hy-MT3-1.8B para confirmar condiciones de uso comercial y atribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de esta cuantización concreta.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/shoutmon/Hy-MT3-1.8B-IQ4_XS-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Herramienta de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
