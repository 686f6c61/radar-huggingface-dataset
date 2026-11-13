# Alptekinege/PHPko-31M

## Resumen

PHPko-31M es un modelo de lenguaje de 30,7 millones de parámetros especializado en autocompletado de código PHP, desarrollado por el usuario Alptekinege y publicado en Hugging Face bajo licencia Apache 2.0. A diferencia de la mayoría de modelos de código disponibles, no es un ajuste fino de un modelo base existente: se ha entrenado desde cero con inicialización aleatoria sobre un corpus de aproximadamente 24,5 millones de tokens de PHP extraídos de 41 proyectos open source con licencias permisivas (MIT y BSD-3).

El modelo implementa una arquitectura transformer decoder-only de estilo Qwen3 escrita desde cero en PyTorch, con 8 capas, tamaño oculto de 512, atención con Grouped-Query Attention (GQA) de 8 cabezas de consulta y 2 de clave/valor, normalización RMSNorm, RoPE con theta de 1.000.000, QK-Norm y feed-forward SwiGLU. Carga como un `Qwen3ForCausalLM` estándar, por lo que no requiere `trust_remote_code`. Su ventana de contexto es de 1024 tokens, aunque fue entrenado con ventanas de 512.

Su relevancia práctica radica en el tamaño: con apenas 31M de parámetros y pesos en float32 (unos 0,1 GB de repositorio), puede ejecutarse en CPU de portátil con latencias de aproximadamente 0,3 segundos por autocompletado corto, lo que lo hace viable como motor de autocompletado en vivo dentro de un editor. No es un asistente conversacional ni un modelo de instrucciones: está diseñado exclusivamente para continuar código PHP que el usuario ya ha empezado a escribir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (implementado desde cero en PyTorch) |
| Parametros totales | 30.746.112 (30,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenado con ventanas de 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | PHP (código); idiomas naturales no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalización RMSNorm en configuración pre-norm, embeddings de entrada y salida atados (tied), sin sesgos en las capas lineales, y feed-forward SwiGLU de tamaño 1408. La atención usa Grouped-Query Attention con 8 cabezas de consulta y 2 de clave/valor, dimensión de cabeza 64, y aplica QK-Norm (RMSNorm sobre Q y K antes de RoPE). Las posiciones se codifican con RoPE y theta de 1.000.000. El vocabulario es de 16.000 tokens mediante un BPE a nivel de byte entrenado específicamente sobre el corpus PHP, lo que le permite representar cualquier secuencia de bytes y empaquetar PHP de forma eficiente (unas 4,1 caracteres por token).

El entrenamiento se realizó con predicción del siguiente token (causal LM) durante 4000 pasos, con optimizador AdamW y decaimiento coseno del learning rate con warmup, sobre una única GPU de capa gratuita. El corpus consta de unos 24,5M de tokens de PHP procedentes de 29.844 ficheros de 41 proyectos open source con licencias MIT o BSD-3 (Laravel, Symfony, Doctrine, PHPUnit, Twig, Guzzle, CakePHP, Composer, entre otros). Se excluyeron deliberadamente proyectos con copyleft (GPL) como WordPress o Drupal para evitar obligaciones de licencia, y se filtraron directorios vendor, tests, código generado, ficheros minificados, tablas de traducción y duplicados exactos, eliminando además los comentarios de cabecera de licencia. La pérdida de validación reportada es 1,1826 (perplejidad aproximada de 3,3).

## Capacidades

- Autocompletado de código PHP: continúa código ya iniciado, incluyendo cuerpos de clase, firmas de métodos, declaraciones de propiedades y docblocks.
- Generación de PHP moderno e idiomático: firmas tipadas (`: string`, `?int`), promoción de propiedades en constructor, retorno fluido `return $this;` y formateo estilo PSR.
- Conocimiento de convenciones de frameworks presentes en el corpus: Symfony, Laravel, Doctrine y PHPUnit, entre otros.
- Tokenizador BPE a nivel de byte entrenado sobre PHP, con buena compresión del lenguaje (unas 4,1 caracteres por token).
- Inferencia en CPU: aproximadamente 0,3 segundos por autocompletado corto, apto para autocompletado en vivo en editor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta modo thinking, visión ni audio.
- No soporta fill-in-the-middle (FIM): solo ve el código anterior al cursor; no debe enviarse sufijo.
- No es un modelo de instrucciones: no responde a peticiones conversacionales.

## Casos de uso

- Autocompletado en vivo en el editor: el modelo recibe el prefijo de código PHP que el usuario está escribiendo y devuelve la continuación en unos 0,3 segundos en CPU, lo que permite integrarlo como motor de sugerencias en extensiones de editor sin necesidad de GPU ni servicios externos.
- Generación de esqueletos de clase y métodos: dado el inicio de una clase con propiedades declaradas, completa firmas de métodos, docblocks y cuerpos básicos siguiendo convenciones PSR y de frameworks como Laravel o Symfony.
- Relleno de código repetitivo en proyectos PHP: útil para completar getters, setters, constructores con promoción de propiedades, métodos fluidos y declaraciones de propiedades tipadas en código de infraestructura.
- Asistencia offline en entornos sin conectividad: al caber en CPU y ocupar unos 0,1 GB, puede desplegarse localmente en portátiles de desarrollo o entornos aislados donde no se permite enviar código a servicios en la nube.
- Prototipado rápido de fragmentos PHP: para generar borradores de métodos y estructuras de clase que el desarrollador revisará y corregirá después, acelerando la escritura inicial de código boilerplate.
- Educación y demostración de modelos de código pequeños: sirve como ejemplo didáctico de entrenamiento desde cero de un transformer estilo Qwen3 sobre un dominio concreto, con arquitectura y datos documentados de forma transparente.
- Integración en pipelines de generación de código con revisión humana obligatoria: puede emplearse como primer paso de generación de fragmentos PHP en herramientas internas, siempre que la salida pase por revisión y tests automáticos antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación (1,1826, perplejidad aproximada de 3,3) y una latencia estimada de unos 0,3 segundos por autocompletado corto en CPU. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de código PHP.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal; los pesos en float32 ocupan aproximadamente 0,12 GB (30,7M de parámetros × 4 bytes), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1 GB de memoria es suficiente. El modelo está pensado para ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: `transformers` (versión 4.51 o superior), con carga como `Qwen3ForCausalLM`. El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documentan opciones para llama.cpp, Ollama ni vLLM.
- Latencia y throughput: aproximadamente 0,3 segundos por autocompletado corto en CPU según el autor. No se reportan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PHPko-31M | 30,7M | 1024 | Autocompletado PHP | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B | 0,5B | 32.768 | Código generalista | Apache 2.0 | Hugging Face |
| StarCoder2-3B | 3B | 16.384 | Código generalista | BigCode OpenRAIL-M | Hugging Face |

La comparación con modelos generalistas de código es desigual por tamaño: PHPko-31M es dos órdenes de magnitud menor que Qwen2.5-Coder-0.5B y StarCoder2-3B, y está especializado exclusivamente en PHP, mientras que los otros cubren múltiples lenguajes. No se dispone de datos de benchmarks que permitan comparar rendimiento de forma objetiva entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un chatbot ni sigue instrucciones: promptear con peticiones en lenguaje natural no funciona; debe proporcionarse el inicio del código.
- No comprende la lógica del programa: genera código que parece correcto con más fiabilidad que código realmente correcto; por ejemplo, puede devolver `0` en lugar de sumar en un método `add(Money $other)`.
- Tendencia a repetirse: puede emitir el mismo método dos veces; se recomienda usar `repetition_penalty` de aproximadamente 1,15 y limitar `max_new_tokens`.
- Sin fill-in-the-middle: solo procesa el prefijo, no el sufijo; no debe enviarse sufijo.
- No conoce el código base del usuario, APIs privadas ni nada fuera de su corpus de entrenamiento.
- No apto para código sensible a la seguridad: puede producir código inseguro o no funcional; toda salida debe revisarse.
- Solo PHP: el rendimiento en otros lenguajes será pobre.
- Temperaturas muy bajas (menos de 0,1) provocan bucles de repetición.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los derivados del corpus de proyectos open source utilizados.
- Riesgo de alucinación: alto en cuanto a lógica de negocio; el modelo prioriza la plausibilidad sintáctica sobre la corrección semántica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que el modelo no debe usarse para código sensible a la seguridad sin revisión.
- Limitación de contexto: 1024 tokens, entrenado con ventanas de 512, lo que restringe la cantidad de código previo que puede considerar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alptekinege/PHPko-31M
- Corpus de entrenamiento (proyectos citados en la model card): Carbon (https://github.com/briannesbitt/Carbon.git), FastRoute (https://github.com/nikic/FastRoute.git), PHP-Parser (https://github.com/nikic/PHP-Parser.git), Slim (https://github.com/slimphp/Slim.git), Sylius (https://github.com/Sylius/Sylius.git), Twig (https://github.com/twigphp/Twig.git), Bagisto (https://github.com/bagisto/bagisto.git), CakePHP (https://github.com/cakephp/cakephp.git), Doctrine Collections (https://github.com/doctrine/collections.git), Collision (https://github.com/nunomaduro/collision.git), CommonMark (https://github.com/thephpleague/commonmark.git), Composer (https://github.com/composer/composer.git), API Platform Core (https://github.com/api-platform/core.git), League CSV (https://github.com/thephpleague/csv.git), Doctrine DBAL (https://github.com/doctrine/dbal.git), Filament (https://github.com/filamentphp/filament.git), Flysystem (https://github.com/thephpleague/flysystem.git), Laravel Framework (https://github.com/laravel/framework.git), Guzzle (https://github.com/guzzle/guzzle.git), Laravel Horizon (https://github.com/laravel/horizon.git), Laminas MVC (https://github.com/laminas/laminas-mvc.git)
